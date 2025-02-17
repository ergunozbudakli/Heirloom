# Heirloom - El Yapımı Lüks Mumlar E-Ticaret Sitesi

Heirloom, el yapımı lüks mumların satışını yapan modern bir e-ticaret platformudur. React ve Node.js teknolojileri kullanılarak geliştirilmiştir.

## 🚀 Özellikler

- Kullanıcı kaydı ve girişi
- Sepet yönetimi (localStorage ve veritabanı senkronizasyonu)
- Ürün listeleme ve detay görüntüleme
- Güvenli ödeme işlemleri
- Responsive tasarım
- Kullanıcı dostu arayüz

## 🛠️ Teknolojiler

### Frontend
- React.js
- React Router
- Context API
- FontAwesome
- CSS3 (Custom styling)

### Backend
- Node.js
- Express.js
- MS SQL Server
- JWT Authentication
- Bcrypt

## 💻 Kurulum

### Gereksinimler
- Node.js (v14 veya üzeri)
- MS SQL Server
- npm veya yarn

### Adımlar

1. Projeyi klonlayın:
```bash
git clone https://github.com/your-username/heirloom.git
cd heirloom
```

2. Frontend bağımlılıklarını yükleyin:
```bash
npm install
```

3. Backend bağımlılıklarını yükleyin:
```bash
cd backend
npm install
```

4. Veritabanı ayarları:
- MS SQL Server'ı yükleyin
- `.env` dosyasını düzenleyin:
```env
DB_SERVER=localhost\SQLEXPRESS
DB_USER=your_username
DB_PASSWORD=your_password
DB_DATABASE=HeirloomDB
```

5. Uygulamayı başlatın:

Frontend için:
```bash
npm start
```

Backend için:
```bash
cd backend
npm run dev
```

## 🌐 Ortam Değişkenleri

### Frontend (.env)
```env
REACT_APP_API_URL=http://192.168.50.33:5000
PORT=3001
```