const mongodb = require('mongodb');
const { getDb } = require('../util/database');

class Product {
  constructor(title, price, description, imageUrl) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
  }

  async save() {
    const db = getDb();

    try {
      let res = await db.collection('products').insertOne(this);

      return res;
    } catch (err) {
      console.log(err);
    }
  }

  static async fetchAll() {
    const db = getDb();

    try {
      let products = await db
        .collection('products')
        .find()
        .toArray();

      return products;
    } catch (err) {
      console.log(err);
    }
  }

  static async findById(productId) {
    const db = getDb();

    try {
      let product = await db
        .collection('products')
        .find({ _id: new mongodb.ObjectID(productId) })
        .next();

      return product;
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = Product;
