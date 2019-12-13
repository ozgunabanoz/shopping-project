require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoDbStore = require('connect-mongodb-session')(session);

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();
const store = new MongoDbStore({
  uri: process.env.MONGO_URI,
  collection: 'sessions'
});

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store
  })
);

app.use(async (req, res, next) => {
  if (!req.session.user) {
    return next();
  }

  let user;

  try {
    user = await User.findById(req.session.user._id);
    req.user = user;

    next();
  } catch (err) {
    console.log(err);
  }
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    let user = await User.findOne(); // this is a temporary solution, we're using dummy user for now

    if (!user) {
      const user = new User({
        // dummy user
        name: 'Ozgun',
        email: 'o@o.com',
        cart: {
          items: []
        }
      });

      await user.save();
    }

    app.listen(process.env.PORT || 3000);
  } catch (err) {
    console.log(err);
  }
})();
