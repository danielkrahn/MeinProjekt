const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.signup = catchAsync(async (req, res, next) => {
  //Hier wieder await da es sonst den ganzen code aufhalten würde bis die methode durchgelaufen ist
  const newUser = await User.create(req.body);
  res.status(200).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});
