const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = async (req, res, next) => {
  let products;

  try {
    products = await Product.find();

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
    product = await Product.findById(prodId);

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
    products = await Product.find();

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
  let user;
  let products = [];

  try {
    user = await req.user
      .populate('cart.items.productId')
      .execPopulate();
    products = user.cart.items;

    res.render('shop/cart', {
      path: '/cart',
      pageTitle: 'Your Cart',
      products: products
    });
  } catch (err) {
    console.log(err);
  }
};

exports.postCart = async (req, res, next) => {
  const prodId = req.body.productId;
  let product;

  try {
    product = await Product.findById(prodId);

    await req.user.addToCart(product);
    res.redirect('/cart');
  } catch (err) {
    console.log(err);
  }
};

exports.postCartDeleteProduct = async (req, res, next) => {
  const prodId = req.body.productId;

  try {
    await req.user.deleteItemFromCart(prodId);

    res.redirect('/cart');
  } catch (err) {
    console.log(err);
  }
};

exports.postOrder = async (req, res, next) => {
  let user;
  let products;

  try {
    user = await req.user
      .populate('cart.items.productId')
      .execPopulate();
    products = user.cart.items.map(i => {
      return {
        quantity: i.quantity,
        productData: { ...i.productId._doc }
      };
    });

    const order = new Order({
      user: {
        email: req.user.email,
        userId: req.user
      },
      products
    });

    await order.save();
    await req.user.clearCart();
    res.redirect('/orders');
  } catch (err) {
    console.log(err);
  }
};

exports.getOrders = async (req, res, next) => {
  let orders;

  try {
    orders = await Order.find({
      'user.userId': req.user._id
    });

    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders
    });
  } catch (err) {
    console.log(err);
  }
};
