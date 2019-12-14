const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_KEY
    }
  })
);

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Log In',
    isAuthenticated: false,
    errorMessage: message
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false,
    errorMessage: message
  });
};

exports.postLogin = async (req, res, next) => {
  let user;
  let email = req.body.email;
  let password = req.body.password;

  try {
    user = await User.findOne({ email });

    if (!user) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/login');
    }

    let match = await bcrypt.compare(password, user.password);

    if (!match) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/login');
    }

    req.session.user = user;
    req.session.isLoggedIn = true;

    await req.session.save();
    res.redirect('/');
  } catch (err) {
    console.log(err);
    res.redirect('/login');
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
      req.flash('error', 'Email already taken');
      return res.redirect('/signup');
    }

    let hashedPassword = await bcrypt.hash(password, 12);

    let newUser = new User({
      password: hashedPassword,
      email,
      cart: { items: [] }
    });

    await newUser.save();
    await transporter.sendMail({
      to: email,
      from: 'shop@ozznode.com',
      subject: 'Signup is succeeded',
      html: `<h1>Welcome buddeh</h1>`
    });
    res.redirect('/login');
  } catch (err) {
    console.log(err);
    res.redirect('/signup');
  }
};
