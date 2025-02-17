const { database, sql } = require('../config/db');

class Address {
    constructor(addressData) {
        this.userId = addressData.userId;
        this.addressTitle = addressData.addressTitle;
        this.firstName = addressData.firstName;
        this.lastName = addressData.lastName;
        this.phone = addressData.phone;
        this.city = addressData.city;
        this.district = addressData.district;
        this.neighborhood = addressData.neighborhood;
        this.postalCode = addressData.postalCode;
        this.addressText = addressData.addressText;
        this.isDefault = addressData.isDefault || false;
    }

    async save() {
        try {
            const pool = await database.connect();
            
            // Eğer varsayılan adres olarak işaretlendiyse, diğer adresleri varsayılan olmaktan çıkar
            if (this.isDefault) {
                await pool.request()
                    .input('userId', sql.Int, this.userId)
                    .query('UPDATE Addresses SET IsDefault = 0 WHERE UserID = @userId');
            }

            const result = await pool.request()
                .input('userId', sql.Int, this.userId)
                .input('addressTitle', sql.NVarChar, this.addressTitle)
                .input('firstName', sql.NVarChar, this.firstName)
                .input('lastName', sql.NVarChar, this.lastName)
                .input('phone', sql.NVarChar, this.phone)
                .input('city', sql.NVarChar, this.city)
                .input('district', sql.NVarChar, this.district)
                .input('neighborhood', sql.NVarChar, this.neighborhood)
                .input('postalCode', sql.NVarChar, this.postalCode)
                .input('addressText', sql.NVarChar, this.addressText)
                .input('isDefault', sql.Bit, this.isDefault)
                .query(`
                    INSERT INTO Addresses (
                        UserID, AddressTitle, FirstName, LastName, Phone,
                        City, District, Neighborhood, PostalCode, AddressText,
                        IsDefault, CreatedAt, UpdatedAt
                    )
                    VALUES (
                        @userId, @addressTitle, @firstName, @lastName, @phone,
                        @city, @district, @neighborhood, @postalCode, @addressText,
                        @isDefault, GETDATE(), GETDATE()
                    );
                    SELECT SCOPE_IDENTITY() AS AddressID;
                `);

            return result.recordset[0].AddressID;
        } catch (error) {
            throw new Error('Adres kaydedilemedi: ' + error.message);
        }
    }

    static async findByUserId(userId) {
        try {
            const pool = await database.connect();
            const result = await pool.request()
                .input('userId', sql.Int, userId)
                .query(`
                    SELECT 
                        AddressID as id,
                        AddressTitle as title,
                        FirstName as firstName,
                        LastName as lastName,
                        Phone as phone,
                        City as city,
                        District as district,
                        Neighborhood as neighborhood,
                        PostalCode as postalCode,
                        AddressText as addressText,
                        IsDefault as isDefault,
                        CreatedAt as createdAt,
                        UpdatedAt as updatedAt
                    FROM Addresses 
                    WHERE UserID = @userId
                    ORDER BY IsDefault DESC, CreatedAt DESC
                `);

            return result.recordset;
        } catch (error) {
            throw new Error('Adresler getirilemedi: ' + error.message);
        }
    }

    static async findById(addressId) {
        try {
            const pool = await database.connect();
            const result = await pool.request()
                .input('addressId', sql.Int, addressId)
                .query(`
                    SELECT 
                        AddressID as id,
                        UserID as userId,
                        AddressTitle as title,
                        FirstName as firstName,
                        LastName as lastName,
                        Phone as phone,
                        City as city,
                        District as district,
                        Neighborhood as neighborhood,
                        PostalCode as postalCode,
                        AddressText as addressText,
                        IsDefault as isDefault,
                        CreatedAt as createdAt,
                        UpdatedAt as updatedAt
                    FROM Addresses 
                    WHERE AddressID = @addressId
                `);

            return result.recordset[0];
        } catch (error) {
            throw new Error('Adres bulunamadı: ' + error.message);
        }
    }

    static async update(addressId, addressData) {
        try {
            const pool = await database.connect();

            // Eğer varsayılan adres olarak işaretlendiyse, diğer adresleri varsayılan olmaktan çıkar
            if (addressData.isDefault) {
                await pool.request()
                    .input('userId', sql.Int, addressData.userId)
                    .query('UPDATE Addresses SET IsDefault = 0 WHERE UserID = @userId');
            }

            await pool.request()
                .input('addressId', sql.Int, addressId)
                .input('addressTitle', sql.NVarChar, addressData.addressTitle)
                .input('firstName', sql.NVarChar, addressData.firstName)
                .input('lastName', sql.NVarChar, addressData.lastName)
                .input('phone', sql.NVarChar, addressData.phone)
                .input('city', sql.NVarChar, addressData.city)
                .input('district', sql.NVarChar, addressData.district)
                .input('neighborhood', sql.NVarChar, addressData.neighborhood)
                .input('postalCode', sql.NVarChar, addressData.postalCode)
                .input('addressText', sql.NVarChar, addressData.addressText)
                .input('isDefault', sql.Bit, addressData.isDefault)
                .query(`
                    UPDATE Addresses
                    SET AddressTitle = @addressTitle,
                        FirstName = @firstName,
                        LastName = @lastName,
                        Phone = @phone,
                        City = @city,
                        District = @district,
                        Neighborhood = @neighborhood,
                        PostalCode = @postalCode,
                        AddressText = @addressText,
                        IsDefault = @isDefault,
                        UpdatedAt = GETDATE()
                    WHERE AddressID = @addressId
                `);

            return true;
        } catch (error) {
            throw new Error('Adres güncellenemedi: ' + error.message);
        }
    }

    static async delete(addressId) {
        try {
            const pool = await database.connect();
            await pool.request()
                .input('addressId', sql.Int, addressId)
                .query('DELETE FROM Addresses WHERE AddressID = @addressId');

            return true;
        } catch (error) {
            throw new Error('Adres silinemedi: ' + error.message);
        }
    }

    static async setDefault(addressId, userId) {
        try {
            const pool = await database.connect();
            
            // Önce tüm adresleri varsayılan olmaktan çıkar
            await pool.request()
                .input('userId', sql.Int, userId)
                .query('UPDATE Addresses SET IsDefault = 0 WHERE UserID = @userId');

            // Seçilen adresi varsayılan yap
            await pool.request()
                .input('addressId', sql.Int, addressId)
                .query('UPDATE Addresses SET IsDefault = 1 WHERE AddressID = @addressId');

            return true;
        } catch (error) {
            throw new Error('Varsayılan adres değiştirilemedi: ' + error.message);
        }
    }
}

module.exports = Address; 