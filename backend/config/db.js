const sql = require('mssql');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || 'HeirloomDB',
  server: 'localhost',
  instanceName: 'SQLEXPRESS',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    connectTimeout: 30000,
    requestTimeout: 30000,
    authentication: {
      type: 'default'
    }
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

class Database {
  constructor() {
    this.pool = null;
    this.connected = false;
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  async createTables() {
    try {
      const sqlFilePath = path.join(__dirname, 'createTables.sql');
      const createTablesSql = fs.readFileSync(sqlFilePath, 'utf8');
      
      await this.query(createTablesSql);
      console.log('Tablolar başarıyla oluşturuldu veya güncellendi');
    } catch (error) {
      console.error('Tablolar oluşturulurken hata:', error);
      throw error;
    }
  }

  async connect() {
    try {
      console.log('Veritabanına bağlanılıyor...');
      console.log('Bağlantı bilgileri:', {
        server: config.server,
        database: config.database,
        user: config.user,
        instanceName: config.instanceName
      });

      if (!this.pool) {
        this.pool = await new sql.ConnectionPool(config).connect();
        this.connected = true;
        this.retryCount = 0;
        console.log('Veritabanına başarıyla bağlanıldı.');
        
        // Tabloları oluştur
        await this.createTables();
      }

      return this.pool;
    } catch (error) {
      console.error('Veritabanı bağlantı hatası:', error);
      this.connected = false;

      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`Bağlantı yeniden deneniyor... (${this.retryCount}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5 saniye bekle
        return this.connect();
      }

      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.pool) {
        await this.pool.close();
        this.pool = null;
        this.connected = false;
        console.log('Veritabanı bağlantısı kapatıldı.');
      }
    } catch (error) {
      console.error('Veritabanı bağlantısı kapatılırken hata:', error);
      throw error;
    }
  }

  async query(queryText, params = []) {
    try {
      if (!this.connected) {
        await this.connect();
      }

      const request = this.pool.request();
      
      // Parametreleri ekle
      params.forEach((param, index) => {
        request.input(`param${index}`, param);
      });

      const result = await request.query(queryText);
      return result;
    } catch (error) {
      console.error('Sorgu çalıştırılırken hata:', error);

      // Bağlantı hatası durumunda yeniden bağlan
      if (error.code === 'ETIMEOUT' || error.code === 'ECONNCLOSED') {
        this.connected = false;
        return this.query(queryText, params);
      }

      throw error;
    }
  }

  async transaction() {
    if (!this.connected) {
      await this.connect();
    }
    return this.pool.transaction();
  }

  isConnected() {
    return this.connected;
  }

  getPool() {
    return this.pool;
  }
}

const database = new Database();

module.exports = {
  database,
  sql
}; 