const Product = require('../models/product');

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

exports.postCart = async (req, res, next) => {
  const prodId = req.body.productId;
  let cart;
  let newQty = 1;

  try {
    cart = await req.user.getCart();
    let products = await cart.getProducts({ where: { id: prodId } });
    let product;

    if (products.length > 0) {
      product = products[0];
    }

    if (product) {
      let oldQty = product.cartItem.quantity;
      newQty = oldQty + 1;
    } else {
      product = await Product.findByPk(prodId);
    }

    await cart.addProduct(product, {
      through: { quantity: newQty }
    });
    res.redirect('/cart');
  } catch (err) {
    console.log(err);
  }
};

exports.postCartDeleteProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  let cart;
  let products;

  try {
    cart = await req.user.getCart();
    products = await cart.getProducts({ where: { id: prodId } });

    let product = products[0];

    await product.cartItem.destroy();
    res.redirect('/cart');
  } catch (err) {
    console.log(err);
  }
};

exports.postOrder = async (req, res, next) => {
  let cart;
  let products;
  let order;

  try {
    cart = await req.user.getCart();
    products = await cart.getProducts();
    order = await req.user.createOrder();

    await order.addProducts(
      products.map(p => {
        p.orderItem = { quantity: p.cartItem.quantity };

        return p;
      })
    );
    await cart.setProducts(null);
    res.redirect('/orders');
  } catch (err) {
    console.log(err);
  }
};

exports.getOrders = async (req, res, next) => {
  let orders;

  try {
    orders = await req.user.getOrders({ include: ['products'] });

    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders
    });
  } catch (err) {
    console.log(err);
  }
};
