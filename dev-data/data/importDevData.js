const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Tour = require('../../models/tourModel');

dotenv.config({ path: './config.env' });

//Variable in der die URL für die Datenbank steckt
const DB = process.env.DATABASE;
//Mongoose bekommt eine URL Übergeben über die es sich mit der Datenbank verbinden kann
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    console.log(con.connections);
    console.log('Connection Succssesfull');
  });

//JSON File lesen
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf8'));
//Daten Importieren
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successesfully loaded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//Alle Daten aus der Datenbank löschen
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successesfully deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
