const express = require('express');
const router = express.Router();
const axios = require('axios');
const NodeCache = require('node-cache');
const sql = require('mssql');
const config = require('../config/dbConfig');

// Önbellek oluştur (1 saat süreyle)
const cache = new NodeCache({ stdTTL: 3600 });

// API endpoint'leri
const API_BASE_URL = 'https://turkiyeapi.dev/api/v1';

// SQL Server'a bağlan
let pool;
const connectDB = async () => {
    try {
        if (!pool) {
            pool = await sql.connect(config);
            console.log('Veritabanına bağlandı');
        }
        return pool;
    } catch (error) {
        console.error('Veritabanı bağlantı hatası:', error);
        throw error;
    }
};

// İlleri getir
router.get('/provinces', async (req, res) => {
    try {
        let provinces = cache.get('provinces');
        
        if (!provinces) {
            console.log('İller API\'den getiriliyor...');
            const response = await axios.get(`${API_BASE_URL}/provinces`);
            if (response.data.status !== 'OK') {
                throw new Error('API\'den geçerli veri alınamadı');
            }
            provinces = response.data.data;
            cache.set('provinces', provinces);
        } else {
            console.log('İller önbellekten alındı');
        }
        
        res.json({
            success: true,
            data: provinces,
            total: provinces.length
        });
    } catch (error) {
        console.error('İller getirilirken hata:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'İller yüklenirken bir hata oluştu: ' + error.message 
        });
    }
});

// İlçeleri getir
router.get('/districts/:provinceId', async (req, res) => {
    try {
        const pool = await connectDB();
        const provinceId = req.params.provinceId;
        const cacheKey = `districts_${provinceId}`;
        
        let districts = cache.get(cacheKey);
        
        if (!districts) {
            console.log(`${provinceId} ID'li ilin ilçeleri veritabanından getiriliyor...`);

            // Veritabanından ilçeleri getir
            const result = await pool.request()
                .input('cityId', sql.Int, provinceId)
                .query(`
                    SELECT 
                        DistrictID as id,
                        DistrictName as name
                    FROM Districts 
                    WHERE CityID = @cityId
                    ORDER BY DistrictName
                `);

            districts = result.recordset;
            cache.set(cacheKey, districts);
        } else {
            console.log('İlçeler önbellekten alındı');
        }
        
        res.json({
            success: true,
            data: districts,
            total: districts.length
        });
    } catch (error) {
        console.error('İlçeler getirilirken hata:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'İlçeler yüklenirken bir hata oluştu: ' + error.message 
        });
    }
});

// Mahalleleri getir
router.get('/neighborhoods/:districtId', async (req, res) => {
    try {
        const pool = await connectDB();
        const districtId = req.params.districtId;
        const cacheKey = `neighborhoods_${districtId}`;
        
        let neighborhoods = cache.get(cacheKey);
        
        if (!neighborhoods) {
            console.log(`${districtId} ID'li ilçenin mahalleleri veritabanından getiriliyor...`);

            // Veritabanından mahalleleri getir
            const result = await pool.request()
                .input('districtId', sql.Int, districtId)
                .query(`
                    SELECT 
                        NeighborhoodID as id,
                        NeighborhoodName as name,
                        PostalCode as postalCode
                    FROM Neighborhoods
                    WHERE DistrictID = @districtId
                    ORDER BY NeighborhoodName
                `);

            neighborhoods = result.recordset;
            cache.set(cacheKey, neighborhoods);
            console.log(`${neighborhoods.length} adet mahalle bulundu`);
        } else {
            console.log('Mahalleler önbellekten alındı');
        }
        
        res.json({
            success: true,
            data: neighborhoods,
            total: neighborhoods.length
        });
    } catch (error) {
        console.error('Mahalleler getirilirken hata:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Mahalleler yüklenirken bir hata oluştu: ' + error.message 
        });
    }
});

// Posta kodunu getir
router.get('/postal-code', async (req, res) => {
    try {
        const { provinceId, districtId, neighborhoodName } = req.query;
        
        if (!provinceId || !districtId || !neighborhoodName) {
            throw new Error('Gerekli parametreler eksik');
        }

        const pool = await connectDB();
        
        // Posta kodunu getir
        const result = await pool.request()
            .input('provinceId', sql.Int, provinceId)
            .input('districtId', sql.Int, districtId)
            .input('neighborhoodName', sql.NVarChar, neighborhoodName)
            .query(`
                SELECT PostalCode
                FROM Neighborhoods
                WHERE DistrictID = @districtId
                AND NeighborhoodName = @neighborhoodName
            `);

        if (result.recordset.length === 0) {
            res.json({
                success: true,
                data: null,
                message: 'Posta kodu bulunamadı'
            });
            return;
        }

        res.json({
            success: true,
            data: result.recordset[0].PostalCode
        });
    } catch (error) {
        console.error('Posta kodu getirme hatası:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Posta kodu yüklenirken bir hata oluştu: ' + error.message 
        });
    }
});

module.exports = router; 