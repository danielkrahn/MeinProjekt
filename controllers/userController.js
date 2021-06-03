const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      //Speichert die objekte aus dem arrway in NewObj dh die erlaubten felder
      newObj[el] = obj[el];
    }
  });
  return newObj;
};
exports.getAllUsers = catchAsync(async (req, res, next) => {
  //wenn der find methode kein object übergeben wird gibt sie alle objekte wieder
  const users = await User.find();
  //console.log(tours);
  res.status(200).json({
    status: 'success',
    data: {
      results: users.length,
      users,
    },
  });
});
exports.updateMe = catchAsync(async (req, res, next) => {
  //error falls passwort geändert werden soll
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'You can not change passwort here, please use the other route',
        400
      )
    );
  //Update des Dokumentes
  //das Objekt wird nach bestimmten Parametern gefiltert die upgedated werden dürfen, ggf noch mehr hinzufügen
  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  //Da ein user eingelggt sein muss um sich zu löschen kann ich es über das req objekt abrufen
  await User.findByIdAndUpdate(
    req.user.id,
    { active: false },
    {
      new: true,
    }
  );
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This Route is not definded yet',
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This Route is not definded yet',
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This Route is not definded yet',
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This Route is not definded yet',
  });
};
