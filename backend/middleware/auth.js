const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // Token'ı header'dan al
        const token = req.headers.authorization.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Yetkilendirme başarısız: Token bulunamadı' });
        }

        // Token'ı doğrula
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Kullanıcı ID'sini request nesnesine ekle
        req.user = { id: decoded.userId };
        
        next();
    } catch (error) {
        console.error('Auth middleware hatası:', error);
        return res.status(401).json({ message: 'Yetkilendirme başarısız: Geçersiz token' });
    }
}; 