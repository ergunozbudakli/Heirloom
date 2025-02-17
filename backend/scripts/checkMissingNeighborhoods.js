const sql = require('mssql');
const config = require('../config/dbConfig');

async function checkMissingNeighborhoods() {
    try {
        console.log('Veritabanına bağlanılıyor...');
        await sql.connect(config);
        console.log('Veritabanı bağlantısı başarılı');

        // İlleri, ilçeleri ve mahalle sayılarını getir
        const result = await sql.query(`
            SELECT 
                c.CityName,
                c.PlateCode,
                d.DistrictName,
                COUNT(n.NeighborhoodID) as NeighborhoodCount
            FROM Cities c
            INNER JOIN Districts d ON d.CityID = c.CityID
            LEFT JOIN Neighborhoods n ON n.DistrictID = d.DistrictID
            GROUP BY c.CityName, c.PlateCode, d.DistrictName
            HAVING COUNT(n.NeighborhoodID) = 0
            ORDER BY c.CityName, d.DistrictName
        `);

        console.log('\nMahallesi Eksik Olan İlçeler:');
        console.log('----------------------------------------');
        
        let currentCity = '';
        let totalMissingDistricts = 0;

        for (const record of result.recordset) {
            if (currentCity !== record.CityName) {
                if (currentCity !== '') {
                    console.log('');
                }
                currentCity = record.CityName;
                console.log(`${record.CityName} (${record.PlateCode}):`);
            }

            console.log(`❌ ${record.DistrictName}`);
            totalMissingDistricts++;
        }

        console.log('\n========================================');
        console.log(`Toplam ${totalMissingDistricts} ilçenin mahallesi eksik`);

    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await sql.close();
        console.log('\nVeritabanı bağlantısı kapatıldı');
    }
}

checkMissingNeighborhoods(); 