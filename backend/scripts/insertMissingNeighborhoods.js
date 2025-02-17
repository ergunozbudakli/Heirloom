const axios = require('axios');
const sql = require('mssql');
const config = require('../config/dbConfig');

const API_BASE_URL = 'https://turkiyeapi.dev/api/v1';
const BATCH_DELAY = 2000; // 2 saniye
const REQUEST_DELAY = 500; // 0.5 saniye
const ERROR_DELAY = 1000; // 1 saniye

// Beklemek için yardımcı fonksiyon
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function getMissingDistricts(pool) {
    const result = await pool.request()
        .query(`
            SELECT 
                d.DistrictID,
                d.ApiDistrictID,
                c.CityName,
                c.PlateCode,
                d.DistrictName
            FROM Cities c
            INNER JOIN Districts d ON d.CityID = c.CityID
            LEFT JOIN Neighborhoods n ON n.DistrictID = d.DistrictID
            WHERE d.ApiDistrictID IS NOT NULL
            GROUP BY d.DistrictID, d.ApiDistrictID, c.CityName, c.PlateCode, d.DistrictName
            HAVING COUNT(n.NeighborhoodID) = 0
            ORDER BY c.CityName, d.DistrictName
        `);
    
    return result.recordset;
}

async function insertNeighborhoods(pool, districtId, neighborhoods) {
    for (const neighborhood of neighborhoods) {
        try {
            await pool.request()
                .input('districtId', sql.Int, districtId)
                .input('neighborhoodName', sql.NVarChar, neighborhood.name)
                .query(`
                    IF NOT EXISTS (
                        SELECT 1 
                        FROM Neighborhoods 
                        WHERE DistrictID = @districtId 
                        AND NeighborhoodName = @neighborhoodName
                    )
                    BEGIN
                        INSERT INTO Neighborhoods (DistrictID, NeighborhoodName)
                        VALUES (@districtId, @neighborhoodName)
                    END
                `);
        } catch (error) {
            console.error(`${neighborhood.name} mahallesi eklenirken hata:`, error.message);
        }
    }
}

async function insertMissingNeighborhoods() {
    let pool;
    try {
        console.log('Veritabanına bağlanılıyor...');
        pool = await sql.connect(config);
        console.log('Veritabanı bağlantısı başarılı');

        const districts = await getMissingDistricts(pool);
        console.log(`\nToplam ${districts.length} ilçenin mahallesi eklenecek`);

        let successCount = 0;
        let errorCount = 0;

        for (const district of districts) {
            try {
                console.log(`\n${district.CityName} - ${district.DistrictName} ilçesi işleniyor...`);
                
                await delay(REQUEST_DELAY);

                const response = await axios.get(`${API_BASE_URL}/neighborhoods`, {
                    params: {
                        districtId: district.ApiDistrictID
                    }
                });

                if (response.data.status === 'OK' && response.data.data) {
                    await insertNeighborhoods(pool, district.DistrictID, response.data.data);
                    console.log(`✅ ${response.data.data.length} mahalle eklendi`);
                    successCount++;
                } else {
                    console.log(`❌ Mahalle verisi alınamadı`);
                    errorCount++;
                }

                // Her ilçeden sonra bekle
                await delay(BATCH_DELAY);

            } catch (error) {
                if (error.response && error.response.status === 429) {
                    console.log('Rate limit aşıldı, 30 saniye bekleniyor...');
                    await delay(30000);
                    districts.push(district); // Bu ilçeyi tekrar dene
                } else {
                    console.error(`Hata:`, error.message);
                    errorCount++;
                }
                await delay(ERROR_DELAY);
            }
        }

        console.log('\n========================================');
        console.log(`İşlem tamamlandı:`);
        console.log(`Başarılı: ${successCount} ilçe`);
        console.log(`Başarısız: ${errorCount} ilçe`);

    } catch (error) {
        console.error('Genel hata:', error);
    } finally {
        if (pool) {
            try {
                await pool.close();
                console.log('\nVeritabanı bağlantısı kapatıldı');
            } catch (err) {
                console.error('Veritabanı bağlantısını kapatırken hata:', err);
            }
        }
    }
}

insertMissingNeighborhoods(); 