const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT Token oluşturma fonksiyonu
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Kullanıcı kaydı
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, birthDate, gender } = req.body;

    // E-posta kontrolü
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanımda.' });
    }

    // Yeni kullanıcı oluşturma
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      phone,
      birthDate,
      gender
    });

    await user.save();

    res.status(201).json({
      message: 'Kullanıcı başarıyla kaydedildi.',
      success: true
    });
  } catch (error) {
    res.status(500).json({
      message: 'Kayıt işlemi sırasında bir hata oluştu.',
      error: error.message
    });
  }
};

// Kullanıcı girişi
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kullanıcıyı bul
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'E-posta veya şifre hatalı.' });
    }

    // Şifreyi kontrol et
    const isPasswordValid = await User.verifyPassword(password, user.PasswordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'E-posta veya şifre hatalı.' });
    }

    // Son giriş tarihini güncelle
    await User.updateLastLogin(user.UserID);

    // Token oluştur
    const token = generateToken(user.UserID);

    res.json({
      message: 'Giriş başarılı.',
      token,
      user: {
        id: user.UserID,
        firstName: user.FirstName,
        lastName: user.LastName,
        name: `${user.FirstName} ${user.LastName}`,
        email: user.Email,
        phone: user.Phone || ''
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Giriş işlemi sırasında bir hata oluştu.',
      error: error.message
    });
  }
}; 