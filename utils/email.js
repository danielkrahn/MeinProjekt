const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //einen transporter erstellen
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,

    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  //email optionen definieren
  const mailOptions = {
    from: 'Daniel Krahn',
    //Der empfänger wird der funktions als Optionsobject übergeben
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  //email senden
  await transporter.sendMail(mailOptions);
};
module.exports = sendEmail;
