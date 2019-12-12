// this is now obsolete. it's for pure mongodb without mongoose

const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;
let _db;

const mongoConnect = async cb => {
  let client;

  try {
    client = await MongoClient.connect(process.env.MONGO_URI);
    _db = client.db();

    console.log('Connected.');
    cb();
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const getDb = () => {
  if (_db) {
    return _db;
  }

  throw 'No Database found.';
};

module.exports = { mongoConnect, getDb };
