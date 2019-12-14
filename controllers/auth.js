const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator');

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
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg
    });
  }

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

exports.getReset = (req, res, next) => {
  let message = req.flash('error');

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, async (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }

    const token = buffer.toString('hex');

    try {
      let user = await User.findOne({ email: req.body.email });

      if (!user) {
        req.flash('error', 'No account with that email found');
        return res.redirect('/reset');
      }

      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;

      await user.save();
      await transporter.sendMail({
        to: req.body.email,
        from: 'shop@ozznode.com',
        subject: 'Password reset',
        html: `
        <p>You requested a password reset</p>
        <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to send a new password</p>
        `
      });
      res.redirect('/');
    } catch (err) {
      console.log(err);
    }
  });
};

exports.getNewPassword = async (req, res, next) => {
  const token = req.params.token;
  let user;

  try {
    user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() }
    });

    let message = req.flash('error');

    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }

    res.render('auth/new-password', {
      path: '/new-password',
      pageTitle: 'New password',
      errorMessage: message,
      userId: user._id.toString(),
      passwordToken: token
    });
  } catch (err) {
    console.log(err);
  }
};

exports.postNewPassword = async (req, res, next) => {
  const { password, userId, passwordToken } = req.body;
  let user;
  let hashedPassword;

  try {
    user = await User.findOne({
      resetToken: passwordToken,
      resetTokenExpiration: { $gt: Date.now() },
      _id: userId
    });

    hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;

    await user.save();
    res.redirect('/login');
  } catch (err) {
    console.log(err);
  }
};
