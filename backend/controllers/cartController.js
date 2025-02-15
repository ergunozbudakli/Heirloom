const Cart = require('../models/Cart');

// Kullanıcının sepetini getir
exports.getCart = async (req, res) => {
  try {
    console.log('getCart isteği alındı:', req.params);
    const userId = req.params.userId;
    const cart = await Cart.getByUserId(userId);
    
    console.log('getCart yanıtı:', cart);
    res.json({
      success: true,
      cart: typeof cart === 'string' ? JSON.parse(cart) : cart
    });
  } catch (error) {
    console.error('getCart hata:', error);
    res.status(500).json({
      success: false,
      message: 'Sepet bilgileri alınamadı',
      error: error.message
    });
  }
};

// Sepeti güncelle veya oluştur
exports.updateCart = async (req, res) => {
  try {
    console.log('updateCart isteği alındı:', { params: req.params, body: req.body });
    const userId = req.params.userId;
    const { cart } = req.body;

    await Cart.save(userId, cart);
    
    console.log('updateCart başarılı');
    res.json({
      success: true,
      message: 'Sepet başarıyla güncellendi'
    });
  } catch (error) {
    console.error('updateCart hata:', error);
    res.status(500).json({
      success: false,
      message: 'Sepet güncellenemedi',
      error: error.message
    });
  }
};

// Sepeti sil
exports.deleteCart = async (req, res) => {
  try {
    console.log('deleteCart isteği alındı:', req.params);
    const userId = req.params.userId;
    await Cart.delete(userId);
    
    console.log('deleteCart başarılı');
    res.json({
      success: true,
      message: 'Sepet başarıyla silindi'
    });
  } catch (error) {
    console.error('deleteCart hata:', error);
    res.status(500).json({
      success: false,
      message: 'Sepet silinemedi',
      error: error.message
    });
  }
}; 