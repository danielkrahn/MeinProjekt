class AppError extends Error {
  constructor(message, statusCode) {
    super(message); //message wird an die übergeordnete klasse übergeben
    this.statusCode = statusCode;
    //Wenn der status mit einer 4 startet ist es ein fail (200 zb wäre ok)
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; // entscheidung zwischen fail und error dh wenn es mit 4 anfängt fail sonst error
    this.isOperational = true; //um meine errors zu kennzeichnen die vom system haben das nicht
    Error.captureStackTrace(this, this.constructor); //damit habe ich den Constructor nicht im Stack
  }
}
module.exports = AppError;
