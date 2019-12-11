require('dotenv').config();
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const sequelize = require('./util/database');
const Product = require('./models/product');
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
    user = await User.findByPk(1);

    req.user = user;
    next();
  } catch (err) {
    console.log(err);
  }
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);

(async () => {
  let user;

  try {
    await sequelize.sync();

    user = await User.findByPk(1);

    if (!user) {
      user = await User.create({
        name: 'Ozgun',
        email: 'a@a.com'
      });
    }

    app.listen(process.env.PORT || 3000);
  } catch (err) {
    console.log(err);
  }
})();
