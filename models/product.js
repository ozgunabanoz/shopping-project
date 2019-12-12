const mongodb = require('mongodb');
const { getDb } = require('../util/database');

class Product {
  constructor(title, price, description, imageUrl, id, userId) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id;
    this.userId = userId;
  }

  async save() {
    const db = getDb();
    let res;

    try {
      if (this._id) {
        res = await db
          .collection('products')
          .updateOne({ _id: this._id }, { $set: this });
      } else {
        res = await db.collection('products').insertOne(this);
      }
    } catch (err) {
      console.log(err);
    }

    return res;
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

  static async deleteById(productId) {
    const db = getDb();

    try {
      return await db
        .collection('products')
        .deleteOne({ _id: new mongodb.ObjectID(productId) });
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = Product;
