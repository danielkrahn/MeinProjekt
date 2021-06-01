const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
    //Funktioniert nur mit der save Methode !!
    validate: {
      validator: function (el) {
        //Vergleicht passwordConfirm mit password, gibt entweder true oder false wieder
        //this, daes sich um das passwort des gleichen objects handelt
        return el === this.password;
      },
      message: 'Passworts are not the same',
    },
  },
});
userSchema.pre('save', async function (next) {
  //Läuft nur wenn das passwort modifiziert wird
  if (!this.isModified('password')) return next();
  //Passwort wird verschlüsselt
  this.password = await bcrypt.hash(this.password, 12);
  //Passwort confirmation löschen
  this.passwordConfirm = undefined;
  next();
});
const User = mongoose.model('User', userSchema);
module.exports = User;
