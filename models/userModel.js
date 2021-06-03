const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
    //wenn diese Option auf false steht wird das Objekt in dem fall passwort nie im Body mitgesendet
    //!Außer beim erstellen des Objektes
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    message: 'This is not an keyword for role',
    default: 'user',
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
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
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
userSchema.pre('save', function (next) {
  //falls das PW nicht geändert wurde oder es ein neues dokument ist überspringe den folgeneden code
  if (!this.isModified('password') || this.isNew) return next();
  // -1000 Um sicher zu gehen, dass der token nach dem datum erstellt wurde 1000 = 1s
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
//was genau macht das methods nochmal?
//glaube damit sind die funktionen über all verwendbar oder so
userSchema.methods.correctPassword = async function (
  candidatePasswort,
  userPassword
) {
  return await bcrypt.compare(candidatePasswort, userPassword);
};
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(this.passwordChangedAt);
    return JWTTimestamp < changedTimestamp;
  }
  //false bedeutet das es nicht verändert wurde
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  //Ist wie ein Reset passwort um ein wirklich neues PW zu machen
  const resetToken = crypto.randomBytes(32).toString('hex');
  //wird verschlüsselt, muss nicht so stark verschlüsselt sein wie das passwort da hier Hacker angriffe nicht so wahrscheinlich sind
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  //PasswortToken wird nach 10 min ungültig wert muss in ms konvertiert werden
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
const User = mongoose.model('User', userSchema);
module.exports = User;
