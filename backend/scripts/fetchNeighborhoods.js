const axios = require('axios');
const sql = require('mssql');
const config = require('../config/dbConfig');

const API_BASE_URL = 'https://turkiyeapi.dev/api/v1';

// Beklemek için yardımcı fonksiyon
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchNeighborhoods() {
    try {
        // Veritabanına bağlan
        console.log('Veritabanına bağlanılıyor...');
        await sql.connect(config);
        console.log('Veritabanına bağlantı başarılı');

        // Sadece mahalleleri eksik olan ilçeleri getir
        const districts = await sql.query(`
            SELECT d.DistrictID, d.ApiDistrictID 
            FROM Districts d
            WHERE d.ApiDistrictID IS NOT NULL
            AND NOT EXISTS (
                SELECT 1 
                FROM Neighborhoods n 
                WHERE n.DistrictID = d.DistrictID
            )
        `);

        console.log(`${districts.recordset.length} adet ilçe için mahalle verisi çekilecek`);

        for (const district of districts.recordset) {
            try {
                console.log(`${district.DistrictID} ID'li ilçenin mahalleleri getiriliyor...`);
                
                // Her istekten önce 2 saniye bekle
                await delay(2000);
                
                // API'den mahalleleri getir
                const response = await axios.get(`${API_BASE_URL}/neighborhoods`, {
                    params: {
                        districtId: district.ApiDistrictID
                    }
                });

                if (response.data.status === 'OK') {
                    // Her mahalle için
                    for (const neighborhood of response.data.data) {
                        // Mahalleyi veritabanına ekle
                        await sql.query`
                            IF NOT EXISTS (
                                SELECT 1 
                                FROM Neighborhoods 
                                WHERE DistrictID = ${district.DistrictID} 
                                AND NeighborhoodName = ${neighborhood.name}
                            )
                            BEGIN
                                INSERT INTO Neighborhoods (DistrictID, NeighborhoodName)
                                VALUES (${district.DistrictID}, ${neighborhood.name})
                            END
                        `;
                    }
                    console.log(`${district.DistrictID} ID'li ilçe için ${response.data.data.length} mahalle eklendi`);
                }
            } catch (error) {
                if (error.response && error.response.status === 429) {
                    console.log('Rate limit aşıldı, 30 saniye bekleniyor...');
                    await delay(30000); // 30 saniye bekle
                    // Bu ilçeyi tekrar dene
                    district.retryCount = (district.retryCount || 0) + 1;
                    if (district.retryCount <= 3) {
                        console.log(`${district.DistrictID} ID'li ilçe için yeniden deneniyor...`);
                        districts.recordset.push(district);
                    } else {
                        console.error(`${district.DistrictID} ID'li ilçe için maksimum deneme sayısına ulaşıldı`);
                    }
                } else {
                    console.error(`${district.DistrictID} ID'li ilçe için hata:`, error.message);
                }
                continue;
            }
        }

        console.log('Tüm mahalleler başarıyla eklendi');
        await sql.close();
        console.log('Veritabanı bağlantısı kapatıldı');

    } catch (error) {
        console.error('Genel hata:', error);
        if (sql.connected) {
            await sql.close();
        }
        process.exit(1);
    }
}

fetchNeighborhoods(); 