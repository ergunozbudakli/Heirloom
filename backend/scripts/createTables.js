const sql = require('mssql');
const config = require('../config/dbConfig');
const fs = require('fs');
const path = require('path');

async function createTables() {
    try {
        // Veritabanına bağlan
        await sql.connect(config);
        console.log('Veritabanına bağlandı');

        // SQL dosyasını oku
        const sqlFile = path.join(__dirname, '../config/createLocationTables.sql');
        const sqlContent = fs.readFileSync(sqlFile, 'utf8');

        // SQL komutlarını çalıştır
        await sql.query(sqlContent);
        
        console.log('Tablolar başarıyla oluşturuldu');
    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await sql.close();
        console.log('Veritabanı bağlantısı kapatıldı');
    }
}

createTables(); 