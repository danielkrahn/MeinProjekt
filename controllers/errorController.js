const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `invalid${err.path}:${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
  //regEx gibt ein Array von Objekten wieder,dass zwischen quotes steht
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field ${value} value pls use an oter value`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  //Unter Values sind die objekte abgespeichert mit map durchlafen wir das array uns suchen nach dem punkt message
  const errors = Object.values(err.errors).map((el) => el.message);
  //Dann fügen wir die Verschiedenen Objekte zu einem String zusammen
  const message = `invalid input data ${errors.join('. ')}`;
  return new AppError(message, 400);
};
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
const sendErrorProd = (err, res) => {
  //wenn es einer meiner eigenen fehler ist soll es ein paar infos dazu geben
  //diese fehler kenne ich nund können behoben werden
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // wenn es keiner meiner eigenen fehler ist soll es einfach eine sehr rudimentäre antwort geben
    //diese könnten sehr zufällig sein und nicht immer behebbar deswegen gibt es nur ein sehr allgemeinen fehler
  } else {
    //Error in die Console loggen
    console.error('Error', err);
    //JSON nachricht senden
    res.status(500).json({
      status: 'error',
      message: 'Ups, Something went wrong :(',
    });
  }
};
//ERRORHANDLING MIDDLEWARE
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; //dies ist unser default wert
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    //Hardkopie meines Err objektes funktioniert leider nicht ganz richtig muss ich mir nochmal anschauen
    let error = JSON.parse(JSON.stringify(err));
    //Wenn es ein cast Error ist dh ein error bei dem etwas nicht iun der datenbank gefunden wurde dann füphre das hier aus
    if (err.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    //Code ist von mongo Db steht für dupilkat als name
    if (err.code === 11000) {
      //hier müsste eig error und nicht err übergeben werden
      error = handleDuplicateFieldsDB(err);
    }
    if (err.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }
    //Um fehler zu händeln muss man nur rausfinden wie diese gekennzeichnet sind, nach dem kennzeichen suchen und dann den fehler behandeln
    sendErrorProd(error, res);
  }
};
