const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = async (req, res, next) => {
  let rows;

  try {
    const returnedData = await Product.fetchAll();

    rows = returnedData[0];
  } catch (err) {
    console.log(err);
  }

  res.render('shop/product-list', {
    prods: rows,
    pageTitle: 'All Products',
    path: '/products'
  });
};

exports.getProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  let product;

  try {
    [product] = await Product.findById(prodId);
  } catch (err) {
    console.log(err);
  }

  res.render('shop/product-detail', {
    product: product[0],
    pageTitle: product.title,
    path: '/products'
  });
};

exports.getIndex = async (req, res, next) => {
  let rows;

  try {
    const returnedData = await Product.fetchAll();

    rows = returnedData[0];
  } catch (err) {
    console.log(err);
  }

  res.render('shop/index', {
    prods: rows,
    pageTitle: 'Shop',
    path: '/'
  });
};

exports.getCart = (req, res, next) => {
  Cart.getCart(cart => {
    Product.fetchAll(products => {
      const cartProducts = [];

      for (product of products) {
        const cartProdData = cart.products.find(
          p => p.id === product.id
        );

        if (cartProdData) {
          cartProducts.push({
            productData: product,
            qty: cartProdData.qty
          });
        }
      }

      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: cartProducts
      });
    });
  });
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
