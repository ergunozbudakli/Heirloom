const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');

// Tüm cart route'ları için authentication gerekli
router.use(authMiddleware);

// Sepeti getir
router.get('/:userId', cartController.getCart);

// Sepeti güncelle
router.post('/:userId', cartController.updateCart);

// Sepeti sil
router.delete('/:userId', cartController.deleteCart);

module.exports = router; 