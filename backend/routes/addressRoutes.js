const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Address = require('../models/Address');

// Kullanıcının tüm adreslerini getir
router.get('/', auth, async (req, res) => {
    try {
        const addresses = await Address.findByUserId(req.user.id);
        res.json({
            success: true,
            data: addresses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Yeni adres ekle
router.post('/', auth, async (req, res) => {
    try {
        const addressData = {
            ...req.body,
            userId: req.user.id
        };

        const address = new Address(addressData);
        const addressId = await address.save();

        const newAddress = await Address.findById(addressId);
        res.status(201).json({
            success: true,
            data: newAddress
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Adres güncelle
router.put('/:id', auth, async (req, res) => {
    try {
        const addressId = parseInt(req.params.id);
        const address = await Address.findById(addressId);

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Adres bulunamadı'
            });
        }

        if (address.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Bu adresi güncelleme yetkiniz yok'
            });
        }

        const addressData = {
            ...req.body,
            userId: req.user.id
        };

        await Address.update(addressId, addressData);
        const updatedAddress = await Address.findById(addressId);

        res.json({
            success: true,
            data: updatedAddress
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Adres sil
router.delete('/:id', auth, async (req, res) => {
    try {
        const addressId = parseInt(req.params.id);
        const address = await Address.findById(addressId);

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Adres bulunamadı'
            });
        }

        if (address.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Bu adresi silme yetkiniz yok'
            });
        }

        await Address.delete(addressId);
        res.json({
            success: true,
            message: 'Adres başarıyla silindi'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Varsayılan adres olarak ayarla
router.put('/:id/set-default', auth, async (req, res) => {
    try {
        const addressId = parseInt(req.params.id);
        const address = await Address.findById(addressId);

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Adres bulunamadı'
            });
        }

        if (address.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Bu adresi varsayılan yapma yetkiniz yok'
            });
        }

        await Address.setDefault(addressId, req.user.id);
        const updatedAddress = await Address.findById(addressId);

        res.json({
            success: true,
            data: updatedAddress
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router; 