const Product = require('../../models/sql/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = async (req, res, next) => {
  const { title, imageUrl, price, description } = req.body;

  try {
    await req.user.createProduct({
      title,
      price,
      imageUrl,
      description
    });

    res.redirect('/');
  } catch (err) {
    console.log(err);
  }
};

exports.getEditProduct = async (req, res, next) => {
  const editMode = req.query.edit;

  if (!editMode) {
    return res.redirect('/');
  }

  const prodId = req.params.productId;
  let products;

  try {
    products = await req.user.getProducts({ where: { id: prodId } });
    let product = products[0];

    if (!product) {
      res.redirect('/');
    }

    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product: product
    });
  } catch (err) {
    console.log(err);
  }
};

exports.postEditProduct = async (req, res, next) => {
  const { title, imageUrl, price, description, productId } = req.body;
  let product;

  try {
    product = await Product.findByPk(productId);

    if (!product) {
      res.redirect('/');
    }

    product.title = title;
    product.imageUrl = imageUrl;
    product.price = price;
    product.description = description;

    await product.save();
    res.redirect('/admin/products');
  } catch (err) {
    console.log(err);
  }
};

exports.getProducts = async (req, res, next) => {
  let products;

  try {
    products = await req.user.getProducts();

    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    });
  } catch (err) {
    console.log(err);
  }
};

exports.postDeleteProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  let product;

  try {
    product = await Product.findByPk(prodId);

    if (!product) {
      res.redirect('/');
    }

    await product.destroy();
    res.redirect('/admin/products');
  } catch (err) {
    console.log(err);
  }
};
