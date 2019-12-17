const { validationResult } = require('express-validator');

const Product = require('../models/product');
const deleteFile = require('../util/file');

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
  const { title, price, description } = req.body;
  const image = req.file;

  if (!image) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      product: {
        title,
        price,
        description
      },
      hasError: true,
      errorMessage: 'Attached file is not an image',
      validationErrors: []
    });
  }

  const imageUrl = image.path.replace('\\', '/');

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      product: {
        title,
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
  const { title, price, description, productId } = req.body;
  const image = req.file;

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      product: {
        title,
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
    product.price = price;
    product.description = description;

    if (image) {
      deleteFile(product.imageUrl);
      product.imageUrl = image.path;
    }

    await product.save();
    res.redirect('/admin/products');
  } catch (err) {
    let error = new Error(err);

    error.httpStatusCode = 500;

    return next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  let product;

  try {
    product = await Product.findById(prodId);

    if (!product) {
      return next(new Error('Product not found.'));
    }

    deleteFile(product.imageUrl);
    await Product.deleteOne({ _id: prodId, userId: req.user._id });

    res.status(200).json({ message: 'Success.' });
  } catch (err) {
    res.status(500).json({ message: 'Product deletion failed.' });
  }
};
