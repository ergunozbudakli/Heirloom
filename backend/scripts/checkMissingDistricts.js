const sql = require('mssql');
const config = require('../config/dbConfig');

async function checkMissingDistricts() {
    try {
        console.log('Veritabanına bağlanılıyor...');
        await sql.connect(config);
        console.log('Veritabanı bağlantısı başarılı');

        // İlleri ve ilçe sayılarını getir
        const result = await sql.query(`
            SELECT 
                c.CityID,
                c.CityName,
                c.PlateCode,
                COUNT(d.DistrictID) as DistrictCount
            FROM Cities c
            LEFT JOIN Districts d ON d.CityID = c.CityID
            GROUP BY c.CityID, c.CityName, c.PlateCode
            ORDER BY 
                CASE 
                    WHEN COUNT(d.DistrictID) = 0 THEN 1 
                    ELSE 2 
                END,
                c.CityName
        `);

        console.log('\nİl ve İlçe Sayıları:');
        console.log('----------------------------------------');
        
        let totalMissingCities = 0;
        for (const city of result.recordset) {
            if (city.DistrictCount === 0) {
                totalMissingCities++;
                console.log(`❌ ${city.CityName} (${city.PlateCode}): Hiç ilçe yok`);
            } else {
                console.log(`✅ ${city.CityName} (${city.PlateCode}): ${city.DistrictCount} ilçe`);
            }
        }

        console.log('----------------------------------------');
        console.log(`Toplam ${result.recordset.length} il var`);
        console.log(`${totalMissingCities} ilin ilçesi eksik`);
        console.log(`${result.recordset.length - totalMissingCities} ilin ilçesi tamam`);

    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await sql.close();
        console.log('\nVeritabanı bağlantısı kapatıldı');
    }
}

checkMissingDistricts(); 