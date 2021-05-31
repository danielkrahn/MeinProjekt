const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const app = require('./app');

//Variable in der die URL für die Datenbank steckt
const DB = process.env.DATABASE;
//Mongoose bekommt eine URL Übergeben über die es sich mit der Datenbank verbinden kann
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    //console.log(con.connections);
    console.log('Connection Succssesfull');
  });

//START SERVER
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on ${port}...`);
});

//Rejection Handling zb. Fehler bei der Verbindung mit der Datenbank
process.on('undhandledRejection', (err) => {
  console.log('Unhadled Rejection... Shutting Down!');
  console.log(err.name, err.message);
  //Falls ein Fehler kommt wird die App heruntergefahren,
  //close lässte den server runterfahrenund nicht direkt komplett abbrechen
  server.close(() => {
    process.exit(1);
  });
});

//Uncaught ExeptionHandling
//sollte weiter oben stehen, damit es auch wirklich fehler fangen kann
process.on('uncaughtExeption', (err) => {
  console.log('Uncaught Exeption... Shutting Down!');
  console.log(err.name, err.message);
  //Falls ein Fehler kommt wird die App heruntergefahren,
  //close lässte den server runterfahrenund nicht direkt komplett abbrechen
  server.close(() => {
    //Uncaught exeptions müssen absürzen da sonst das programm in einem 'unsauberen Zustand' bleibt
    process.exit(1);
  });
});
