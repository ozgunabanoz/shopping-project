const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');

const router = express.Router();

router.get('/add-product', adminController.getAddProduct);

router.get('/products');

router.post('/add-product', adminController.postAddProduct);

router.get('/edit-product/:productId');

router.post('/edit-product');

router.post('/delete-product');

module.exports = router;
