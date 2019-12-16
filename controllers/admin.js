const { validationResult } = require('express-validator');

const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
};

exports.postAddProduct = async (req, res, next) => {
  const errors = validationResult(req);
  const { title, imageUrl, price, description } = req.body;

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      product: {
        title,
        imageUrl,
        price,
        description
      },
      hasError: true,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  const product = new Product({
    title,
    imageUrl,
    price,
    description,
    userId: req.user // mongoose automatically adds user id
  });

  try {
    await product.save();
    res.redirect('/admin/products');
  } catch (err) {
    let error = new Error(err);

    error.httpStatusCode = 500;

    return next(error);
  }
};

exports.getProducts = async (req, res, next) => {
  let products;

  try {
    products = await Product.find({ userId: req.user._id });

    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    });
  } catch (err) {
    let error = new Error(err);

    error.httpStatusCode = 500;

    return next(error);
  }
};

exports.getEditProduct = async (req, res, next) => {
  const editMode = req.query.edit;

  if (!editMode) {
    return res.redirect('/');
  }

  const prodId = req.params.productId;

  try {
    let product = await Product.findById(prodId);

    if (!product) {
      res.redirect('/');
    }

    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product: product,
      hasError: false,
      errorMessage: null,
      validationErrors: []
    });
  } catch (err) {
    let error = new Error(err);

    error.httpStatusCode = 500;

    return next(error);
  }
};

exports.postEditProduct = async (req, res, next) => {
  const errors = validationResult(req);
  const { title, imageUrl, price, description, productId } = req.body;

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      product: {
        title,
        imageUrl,
        price,
        description,
        _id: productId
      },
      hasError: true,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  let product;

  try {
    product = await Product.findById(productId);

    if (product.userId.toString() !== req.user._id.toString()) {
      return res.redirect('/');
    }

    product.title = title;
    product.imageUrl = imageUrl;
    product.price = price;
    product.description = description;

    await product.save();
    res.redirect('/admin/products');
  } catch (err) {
    let error = new Error(err);

    error.httpStatusCode = 500;

    return next(error);
  }
};

exports.postDeleteProduct = async (req, res, next) => {
  const prodId = req.body.productId;

  try {
    await Product.deleteOne({ _id: prodId, userId: req.user._id });

    res.redirect('/admin/products');
  } catch (err) {
    let error = new Error(err);

    error.httpStatusCode = 500;

    return next(error);
  }
};
