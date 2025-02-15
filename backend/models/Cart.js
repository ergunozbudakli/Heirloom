const { database, sql } = require('../config/db');

class Cart {
  static async getByUserId(userId) {
    try {
      console.log('getByUserId çağrıldı:', userId);
      const pool = await database.connect();
      const request = pool.request();
      const result = await request
        .input('getUserId', sql.Int, userId)
        .query(`
          SELECT CartData
          FROM Carts
          WHERE UserID = @getUserId
        `);
      
      console.log('getByUserId sonuç:', result.recordset);
      return result.recordset[0]?.CartData || [];
    } catch (error) {
      console.error('getByUserId hata:', error);
      throw new Error('Sepet bilgileri alınamadı: ' + error.message);
    }
  }

  static async save(userId, cartData) {
    try {
      console.log('save çağrıldı:', { userId, cartData });
      const pool = await database.connect();
      const request = pool.request();
      
      // Önce mevcut sepeti kontrol et
      const existingCart = await request
        .input('checkUserId', sql.Int, userId)
        .query('SELECT CartID FROM Carts WHERE UserID = @checkUserId');

      console.log('Mevcut sepet kontrolü:', existingCart.recordset);

      if (existingCart.recordset.length > 0) {
        // Sepet varsa güncelle
        const updateResult = await request
          .input('updateUserId', sql.Int, userId)
          .input('updateCartData', sql.NVarChar(sql.MAX), JSON.stringify(cartData))
          .input('updateTime', sql.DateTime, new Date())
          .query(`
            UPDATE Carts
            SET CartData = @updateCartData, UpdatedAt = @updateTime
            WHERE UserID = @updateUserId
          `);
        console.log('Sepet güncelleme sonucu:', updateResult);
      } else {
        // Sepet yoksa yeni oluştur
        const insertResult = await request
          .input('newUserId', sql.Int, userId)
          .input('newCartData', sql.NVarChar(sql.MAX), JSON.stringify(cartData))
          .input('createTime', sql.DateTime, new Date())
          .query(`
            INSERT INTO Carts (UserID, CartData, CreatedAt, UpdatedAt)
            VALUES (@newUserId, @newCartData, @createTime, @createTime)
          `);
        console.log('Yeni sepet oluşturma sonucu:', insertResult);
      }
    } catch (error) {
      console.error('save hata:', error);
      throw new Error('Sepet kaydedilemedi: ' + error.message);
    }
  }

  static async delete(userId) {
    try {
      console.log('delete çağrıldı:', userId);
      const pool = await database.connect();
      const request = pool.request();
      const result = await request
        .input('deleteUserId', sql.Int, userId)
        .query('DELETE FROM Carts WHERE UserID = @deleteUserId');
      
      console.log('delete sonuç:', result);
      return result;
    } catch (error) {
      console.error('delete hata:', error);
      throw new Error('Sepet silinemedi: ' + error.message);
    }
  }
}

module.exports = Cart; 