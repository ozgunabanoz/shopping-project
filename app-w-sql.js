// this is the MySQL version

require('dotenv').config();
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');

const sequelize = require('./util/sql/database');
const Product = require('./models/sql/product');
const User = require('./models/sql/user');
const Cart = require('./models/sql/cart');
const CartItem = require('./models/sql/cart-item');
const Order = require('./models/sql/order');
const OrderItem = require('./models/sql/order-item');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/sql/admin');
const shopRoutes = require('./routes/sql/shop');

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
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

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

      await user.createCart();
    }

    app.listen(process.env.PORT || 3000);
  } catch (err) {
    console.log(err);
  }
})();
