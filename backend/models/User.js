const { database, sql } = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  constructor(userData) {
    this.firstName = userData.firstName;
    this.lastName = userData.lastName;
    this.email = userData.email;
    this.password = userData.password;
    this.phone = userData.phone;
    this.birthDate = userData.birthDate;
    this.gender = userData.gender;
  }

  async save() {
    try {
      const pool = await database.connect();
      const hashedPassword = await bcrypt.hash(this.password, 10);
      const request = pool.request();
      
      const result = await request
        .input('firstName', sql.NVarChar, this.firstName)
        .input('lastName', sql.NVarChar, this.lastName)
        .input('email', sql.NVarChar, this.email)
        .input('passwordHash', sql.NVarChar, hashedPassword)
        .input('phone', sql.NVarChar, this.phone)
        .input('birthDate', sql.Date, this.birthDate)
        .input('gender', sql.NVarChar, this.gender)
        .query(`
          INSERT INTO Users (
            FirstName, LastName, Email, PasswordHash, 
            Phone, BirthDate, Gender, CreatedAt, UpdatedAt
          ) 
          VALUES (
            @firstName, @lastName, @email, @passwordHash,
            @phone, @birthDate, @gender, 
            GETDATE(), GETDATE()
          )
        `);
      return result;
    } catch (error) {
      throw new Error('Kullanıcı kaydedilemedi: ' + error.message);
    }
  }

  static async findByEmail(email) {
    try {
      const pool = await database.connect();
      const request = pool.request();
      const result = await request
        .input('email', sql.NVarChar, email)
        .query('SELECT * FROM Users WHERE Email = @email');
      return result.recordset[0];
    } catch (error) {
      throw new Error('Kullanıcı bulunamadı: ' + error.message);
    }
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateLastLogin(userId) {
    try {
      const pool = await database.connect();
      const request = pool.request();
      await request
        .input('userId', sql.Int, userId)
        .query('UPDATE Users SET LastLoginAt = GETDATE() WHERE UserID = @userId');
    } catch (error) {
      throw new Error('Son giriş tarihi güncellenemedi: ' + error.message);
    }
  }
}

module.exports = User; 