const fs = require('fs');
const path = require('path');

const p = path.join(
  path.dirname(process.mainModule.filename),
  'data',
  'cart.json'
);

module.exports = class Cart {
  static addProduct(id, productPrice) {
    fs.readFile(p, (err, content) => {
      let cart = { products: [], totalPrice: 0 };

      if (!err) {
        cart = JSON.parse(content);
      }

      const existingProdIndex = cart.products.findIndex(
        p => p.id === id
      );
      const existingProd = cart.products[existingProdIndex];
      let updatedProd;

      if (existingProd) {
        updatedProd = { ...existingProd };
        updatedProd.qty += 1;
        cart.products = [...cart.products];
        cart.products[existingProdIndex] = updatedProd;
      } else {
        updatedProd = { id: id, qty: 1 };
        cart.products = [...cart.products, updatedProd];
      }

      cart.totalPrice += +productPrice;
      fs.writeFile(p, JSON.stringify(cart), err => {
        console.log(err);
      });
    });
  }

  static deleteProduct(id, productPrice) {
    fs.readFile(p, (err, content) => {
      if (err) {
        return;
      }

      const updatedCart = { ...JSON.parse(content) };
      const product = updatedCart.products.find(p => p.id === id);
      const productQty = product.qty;

      updatedCart.products = updatedCart.products.filter(
        p => p.id !== id
      );
      updatedCart.totalPrice =
        updatedCart.totalPrice - productPrice * productQty;

      fs.writeFile(p, JSON.stringify(updatedCart), err => {
        console.log(err);
      });
    });
  }

  static getCart(cb) {
    fs.readFile(p, (err, content) => {
      const cart = { ...JSON.parse(content) };

      if (err) {
        cb(null);
      } else {
        cb(cart);
      }
    });
  }
};
