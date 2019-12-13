const bcrypt = require('bcryptjs');

const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Log In',
    isAuthenticated: false
  });
};

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false
  });
};

exports.postLogin = async (req, res, next) => {
  let user;

  try {
    user = await User.findById('5df2598dfa75d62050d6e677'); // dummy id

    req.session.user = user;
    req.session.isLoggedIn = true;

    await req.session.save();
    res.redirect('/');
  } catch (err) {
    console.log(err);
  }
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

exports.postSignup = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  let user;

  try {
    user = await User.findOne({ email });

    if (user) {
      return res.redirect('/signup');
    }

    let hashedPassword = await bcrypt.hash(password, 12);

    let newUser = new User({
      password: hashedPassword,
      email,
      cart: { items: [] }
    });

    await newUser.save();
    res.redirect('/login');
  } catch (err) {
    console.log(err);
  }
};
