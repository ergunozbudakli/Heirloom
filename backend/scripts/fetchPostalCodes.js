const axios = require('axios');
const sql = require('mssql');
const config = require('../config/dbConfig');
const fs = require('fs');
const path = require('path');

const POSTAL_CODES_FILE = path.join(__dirname, '../data/postalCodes.json');
const BATCH_SIZE = 50;
const BATCH_DELAY = 2000; // 2 saniye
const REQUEST_DELAY = 500; // 0.5 saniye
const ERROR_DELAY = 1000; // 1 saniye

// Beklemek için yardımcı fonksiyon
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Posta kodları cache'i
let postalCodesCache = null;

// Posta kodlarını yükle
async function loadPostalCodes() {
    if (postalCodesCache) {
        return postalCodesCache;
    }

    try {
        console.log('Posta kodları yükleniyor...');
        const data = fs.readFileSync(POSTAL_CODES_FILE, 'utf8');
        postalCodesCache = JSON.parse(data);
        console.log(`${Object.keys(postalCodesCache).length} adet posta kodu yüklendi`);
        return postalCodesCache;
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error('Posta kodları dosyası bulunamadı. Lütfen dosyayı oluşturun.');
        } else {
            console.error('Posta kodları yüklenirken hata:', error.message);
        }
        return null;
    }
}

async function fetchPostalCode(il, ilce, mahalle) {
    try {
        const postalCodes = await loadPostalCodes();
        if (!postalCodes) {
            return null;
        }

        // İl, ilçe ve mahalle adlarını normalize et
        const normalizedIl = il.toUpperCase().trim();
        const normalizedIlce = ilce.toUpperCase().trim();
        const normalizedMahalle = mahalle.toUpperCase().trim();

        // Posta kodunu bul
        const key = `${normalizedIl}|${normalizedIlce}|${normalizedMahalle}`;
        const postalCode = postalCodes[key];

        if (postalCode) {
            console.log(`${il}-${ilce}-${mahalle} için posta kodu bulundu: ${postalCode}`);
            return postalCode;
        }

        console.log(`${il}-${ilce}-${mahalle} için posta kodu bulunamadı`);
        return null;
    } catch (error) {
        console.error(`Posta kodu getirme hatası (${il}-${ilce}-${mahalle}):`, error.message);
        return null;
    }
}

async function updateNeighborhoodPostalCode(pool, neighborhoodId, postalCode) {
    try {
        await pool.request()
            .input('neighborhoodId', sql.Int, neighborhoodId)
            .input('postalCode', sql.NVarChar, postalCode)
            .query(`
                UPDATE Neighborhoods
                SET PostalCode = @postalCode
                WHERE NeighborhoodID = @neighborhoodId
            `);
        console.log(`${neighborhoodId} ID'li mahalle için posta kodu güncellendi: ${postalCode}`);
    } catch (error) {
        console.error('Posta kodu güncelleme hatası:', error);
    }
}

async function getNeighborhoodBatch(pool, offset, batchSize, onlyNull = true) {
    const result = await pool.request()
        .input('offset', sql.Int, offset)
        .input('batchSize', sql.Int, batchSize)
        .query(`
            SELECT 
                n.NeighborhoodID,
                c.CityName as provinceName,
                d.DistrictName as districtName,
                n.NeighborhoodName as neighborhoodName
            FROM Neighborhoods n
            INNER JOIN Districts d ON d.DistrictID = n.DistrictID
            INNER JOIN Cities c ON c.CityID = d.CityID
            WHERE ${onlyNull ? 'n.PostalCode IS NULL' : '1=1'}
            ORDER BY c.CityName, d.DistrictName, n.NeighborhoodName
            OFFSET @offset ROWS
            FETCH NEXT @batchSize ROWS ONLY
        `);
    
    return result.recordset;
}

async function getTotalCount(pool, onlyNull = true) {
    const result = await pool.request()
        .query(`
            SELECT COUNT(*) as total
            FROM Neighborhoods n
            WHERE ${onlyNull ? 'n.PostalCode IS NULL' : '1=1'}
        `);
    
    return result.recordset[0].total;
}

async function processNeighborhoods() {
    let pool;
    try {
        console.log('Veritabanına bağlanılıyor...');
        pool = await sql.connect(config);
        console.log('Veritabanı bağlantısı başarılı\n');

        // Posta kodu olmayan mahalleleri getir
        const result = await pool.request().query(`
            SELECT 
                n.NeighborhoodID,
                c.CityName as Il,
                d.DistrictName as Ilce,
                n.NeighborhoodName as Mahalle
            FROM Neighborhoods n
            INNER JOIN Districts d ON d.DistrictID = n.DistrictID
            INNER JOIN Cities c ON c.CityID = d.CityID
            WHERE n.PostalCode IS NULL
            ORDER BY c.CityName, d.DistrictName, n.NeighborhoodName
        `);

        const neighborhoods = result.recordset;
        console.log(`Toplam ${neighborhoods.length} adet mahalle işlenecek`);

        let successCount = 0;
        let errorCount = 0;
        let batchCount = 0;

        // Mahalleleri batch'ler halinde işle
        for (let i = 0; i < neighborhoods.length; i += BATCH_SIZE) {
            batchCount++;
            const batch = neighborhoods.slice(i, i + BATCH_SIZE);
            console.log(`\nBatch ${batchCount} başlıyor (${i + 1} - ${Math.min(i + BATCH_SIZE, neighborhoods.length)})`);

            for (const neighborhood of batch) {
                try {
                    console.log(`İşleniyor: ${neighborhood.Il} - ${neighborhood.Ilce} - ${neighborhood.Mahalle}`);
                    
                    const postalCode = await fetchPostalCode(
                        neighborhood.Il,
                        neighborhood.Ilce,
                        neighborhood.Mahalle
                    );

                    if (postalCode) {
                        // Posta kodunu veritabanına kaydet
                        await pool.request()
                            .input('neighborhoodId', sql.Int, neighborhood.NeighborhoodID)
                            .input('postalCode', sql.NVarChar, postalCode)
                            .query(`
                                UPDATE Neighborhoods 
                                SET PostalCode = @postalCode 
                                WHERE NeighborhoodID = @neighborhoodId
                            `);
                        successCount++;
                    } else {
                        errorCount++;
                    }

                    // Her istekten sonra bekle
                    await delay(REQUEST_DELAY);
                } catch (error) {
                    console.error('Hata:', error.message);
                    errorCount++;
                    await delay(ERROR_DELAY);
                }
            }

            // Her batch'ten sonra bekle
            if (i + BATCH_SIZE < neighborhoods.length) {
                console.log(`\nBatch ${batchCount} tamamlandı. ${BATCH_DELAY/1000} saniye bekleniyor...`);
                await delay(BATCH_DELAY);
            }
        }

        console.log('\n========================================');
        console.log('İşlem tamamlandı!');
        console.log(`Başarılı: ${successCount}`);
        console.log(`Başarısız: ${errorCount}`);
        console.log('========================================\n');

    } catch (error) {
        console.error('Genel hata:', error.message);
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}

// Ana fonksiyonu çalıştır
processNeighborhoods(); 