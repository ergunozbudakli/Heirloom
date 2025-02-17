const axios = require('axios');
const sql = require('mssql');
const config = require('../config/dbConfig');

const API_BASE_URL = 'https://turkiyeapi.dev/api/v1';

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function updateDistrictIds() {
    try {
        // Veritabanına bağlan
        await sql.connect(config);
        console.log('Veritabanına bağlandı');

        // Tüm illeri getir
        const provinces = await sql.query`
            SELECT CityID, CityName 
            FROM Cities 
            ORDER BY CityName`;

        for (const province of provinces.recordset) {
            console.log(`\n${province.CityName} ili için ilçeler işleniyor...`);

            try {
                // API'den ilçeleri getir
                const response = await axios.get(`${API_BASE_URL}/districts`, {
                    params: { provinceId: province.CityID }
                });

                if (response.data.status === 'OK' && response.data.data) {
                    const apiDistricts = response.data.data;

                    // Veritabanındaki ilçeleri getir
                    const dbDistricts = await sql.query`
                        SELECT DistrictID, DistrictName, ApiDistrictID
                        FROM Districts
                        WHERE CityID = ${province.CityID}`;

                    for (const dbDistrict of dbDistricts.recordset) {
                        // API'den gelen ilçeyi bul
                        const matchingApiDistrict = apiDistricts.find(d => 
                            d.name.toLowerCase().trim() === dbDistrict.DistrictName.toLowerCase().trim());

                        if (matchingApiDistrict) {
                            // ApiDistrictID'yi güncelle
                            await sql.query`
                                UPDATE Districts 
                                SET ApiDistrictID = ${matchingApiDistrict.id}
                                WHERE DistrictID = ${dbDistrict.DistrictID}`;

                            console.log(`${dbDistrict.DistrictName} ilçesi güncellendi. API ID: ${matchingApiDistrict.id}`);
                        } else {
                            console.log(`${dbDistrict.DistrictName} ilçesi için eşleşme bulunamadı`);
                        }
                    }
                }

                // Rate limiting için bekle
                await delay(500);

            } catch (error) {
                console.error(`${province.CityName} ili için hata:`, error.message);
                continue;
            }
        }

        console.log('\nTüm ilçe ID\'leri güncellendi');
    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await sql.close();
        console.log('Veritabanı bağlantısı kapatıldı');
    }
}

updateDistrictIds(); 