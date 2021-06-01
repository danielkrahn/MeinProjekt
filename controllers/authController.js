const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = catchAsync(async (req, res, next) => {
  //Hier wieder await da es sonst den ganzen code aufhalten würde bis die methode durchgelaufen ist
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  //dem token wird die Id des Users übergeben und ein 'geheimer' String,
  const token = signToken(newUser.id);

  //token wird mit übergeben und wird automatisch eingeloggt
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  //mit dieser Methode lassen sich email und Passwort gleichzeitig aus dem Bode des request extrahieren
  const { email, password } = req.body;
  //Check ob email und pw vorhanden sind
  if (!email || !password) {
    //hier return damit die funktion fall dieser fehler auftritt danach beendent wird
    return next(new AppError('Please insert an email or passwort', 400));
  }
  //check ob user existiert&ob das PW korrekt ist
  //da das paswort satndartmäßig nicht gesendet wird müssen wir es expizit mit der select methode auswählen
  const user = await User.findOne({ email: email }).select('+password');
  // falls es einen user gibt wird der hinter Teil dh der passwort Check ausgeführt
  // fall es keinen user gibt braucht der teil nicht ausgeführt werden und es kommt zu keinem fehler
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Email or Password is not correct', 401));
  }
  //JWT zu client senden
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});
