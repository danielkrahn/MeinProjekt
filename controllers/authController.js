const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.signup = catchAsync(async (req, res, next) => {
  //Hier wieder await da es sonst den ganzen code aufhalten würde bis die methode durchgelaufen ist
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  //dem token wird die Id des Users übergeben und ein 'geheimer' String,
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  //token wird mit übergeben und wird automatisch eingeloggt
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});
