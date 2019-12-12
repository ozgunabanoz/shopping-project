require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(async (req, res, next) => {
  let user;
  try {
    user = await User.findById('5df2598dfa75d62050d6e677'); // dummy id
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
  }
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

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
