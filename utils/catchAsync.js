//asyncFunction wird als Parameter fn übergeben
module.exports = (fn) => (req, res, next) => {
  //über diese funktion werden die errors gefangen
  //dh ich brauche keine try catch blöcke mehr in meinen funktionen
  //sieht alles etwas ordentlicher aus
  fn(req, res, next).catch(next);
};
