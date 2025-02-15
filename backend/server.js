const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { database } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Veritabanı bağlantısı
database.connect()
  .then(() => {
    console.log('Veritabanı bağlantısı başarılı');
  })
  .catch(err => {
    console.error('Veritabanı bağlantı hatası:', err);
    process.exit(1);
  });

// Uygulama kapatıldığında veritabanı bağlantısını kapat
process.on('SIGINT', async () => {
  try {
    await database.disconnect();
    console.log('Uygulama güvenli bir şekilde kapatıldı');
    process.exit(0);
  } catch (error) {
    console.error('Uygulama kapatılırken hata:', error);
    process.exit(1);
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);

// Ana route
app.get('/', (req, res) => {
  res.json({ message: 'Heirloom API çalışıyor' });
});

// Port dinleme
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
}); 