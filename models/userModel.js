const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A User must have a Name'],
  },
  email: {
    type: String,
    required: [true, 'A User must have a Mail'],
    unique: true, //da der User über die Email identifiziert wird müss sie unique sein
    lowercase: true,
    validate: [validator.isEmail, 'Pls Provide a valid Email'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please enter a Password'],
    minlength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm the Password'],
  },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
