class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    //Wenn der status mit einer 4 startet ist es ein fail (200 zb wäre ok)
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; //um meine errors zu kennzeichnen
    Error.captureStackTrace(this, this.constructor); //damit habe ich den Constructor nicht im Stack
  }
}
module.exports = AppError;
