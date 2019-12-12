const ObjectId = require('mongodb').ObjectID;

const { getDb } = require('../util/database');

class User {
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart;
    this._id = id;
  }

  async save() {
    const db = getDb();

    try {
      return db.collection('users').insertOne(this);
    } catch (err) {
      console.log(err);
    }
  }

  async addToCart(product) {
    const db = getDb();
    let newQty = 1;
    let cartProductIndex = this.cart.items.findIndex(
      p => p.productId.toString() === product._id.toString()
    );
    let updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
      newQty = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQty;
    } else {
      updatedCartItems.push({
        productId: product._id,
        quantity: newQty
      });
    }

    let updatedCart = {
      items: updatedCartItems
    };

    try {
      return await db.collection('users').updateOne(
        {
          _id: new ObjectId(this._id)
        },
        { $set: { cart: updatedCart } }
      );
    } catch (err) {
      console.log(err);
    }
  }

  async getCart() {
    const db = getDb();
    const prodIds = this.cart.items.map(item => item.productId);
    let products;

    try {
      products = await db
        .collection('products')
        .find({ _id: { $in: prodIds } })
        .toArray();

      products.map(product => {
        product.quantity = this.cart.items.find(
          item => item.productId.toString() === product._id.toString()
        ).quantity;
      });

      return products;
    } catch (err) {
      console.log(err);
    }
  }

  async deleteItemFromCart(productId) {
    const db = getDb();
    const updatedCartItems = this.cart.items.filter(
      item => item.productId.toString() !== productId.toString()
    );

    try {
      return await db.collection('users').updateOne(
        {
          _id: new ObjectId(this._id)
        },
        { $set: { cart: { items: updatedCartItems } } }
      );
    } catch (err) {
      console.log(err);
    }
  }

  static async findById(userId) {
    const db = getDb();

    try {
      return db
        .collection('users')
        .findOne({ _id: new ObjectId(userId) });
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = User;
