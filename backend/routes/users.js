const express = require('express');
const router = express.Router();
const sql = require('mssql');
const auth = require('../middleware/auth');
const { database } = require('../config/db');

// Profil güncelleme endpoint'i
router.put('/update-profile', auth, async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        const userId = req.user.id;

        // İsmi parçala
        const [firstName, ...lastNameParts] = name.split(' ');
        const lastName = lastNameParts.join(' ');

        // Veritabanına bağlan
        await database.connect();
        const pool = database.getPool();
        
        // Kullanıcı bilgilerini güncelle
        await pool.request()
            .input('userId', sql.Int, userId)
            .input('firstName', sql.NVarChar, firstName)
            .input('lastName', sql.NVarChar, lastName)
            .input('email', sql.NVarChar, email)
            .input('phone', sql.NVarChar, phone)
            .query(`
                UPDATE Users
                SET FirstName = @firstName,
                    LastName = @lastName,
                    Email = @email,
                    Phone = @phone,
                    UpdatedAt = GETDATE()
                WHERE UserID = @userId
            `);

        // Güncellenmiş kullanıcı bilgilerini getir
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query(`
                SELECT 
                    UserID as id,
                    FirstName as firstName,
                    LastName as lastName,
                    FirstName + ' ' + LastName as name,
                    Email as email,
                    Phone as phone
                FROM Users 
                WHERE UserID = @userId
            `);

        const updatedUser = result.recordset[0];
        console.log('Güncellenmiş kullanıcı bilgileri:', updatedUser);
        res.json(updatedUser);
    } catch (error) {
        console.error('Profil güncelleme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası: ' + error.message });
    }
});

module.exports = router; 