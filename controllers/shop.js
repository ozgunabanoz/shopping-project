const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = async (req, res, next) => {
  let products;

  try {
    products = await Product.findAll();

    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  let product;

  try {
    product = await Product.findByPk(prodId);

    res.render('shop/product-detail', {
      product: product,
      pageTitle: product.title,
      path: '/products'
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getIndex = async (req, res, next) => {
  let products;

  try {
    products = await Product.findAll();

    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getCart = async (req, res, next) => {
  let cart;
  let products;

  try {
    cart = await req.user.getCart();
    products = await cart.getProducts();

    res.render('shop/cart', {
      path: '/cart',
      pageTitle: 'Your Cart',
      products: products
    });
  } catch (err) {
    console.log(err);
  }
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;

  Product.findById(prodId, product => {
    Cart.addProduct(prodId, product.price);
  });
  res.redirect('/');
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;

  Product.findById(prodId, product => {
    Cart.deleteProduct(prodId, product.price);
    res.redirect('/cart');
  });
};

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders'
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
