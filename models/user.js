const ObjectId = require('mongodb').ObjectID;

const { getDb } = require('../util/database');

class User {
  constructor(username, email) {
    this.name = username;
    this.email = email;
  }

  async save() {
    const db = getDb();

    try {
      return db.collection('users').insertOne(this);
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
