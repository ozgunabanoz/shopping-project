const path = require('path');

const express = require('express');

const shopController = require('../../controllers/nosql/shop');

const router = express.Router();

router.get('/');

router.get('/products');

router.get('/products/:productId');

router.get('/cart');

router.post('/cart');

router.post('/cart-delete-item');

router.post('/create-order');

router.get('/orders');

module.exports = router;
