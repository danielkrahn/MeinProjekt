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
app.listen(port, () => {
  console.log(`App running on ${port}...`);
});
