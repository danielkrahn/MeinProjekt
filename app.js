const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler =require('./controllers/errorController')
const app = express();
//MIDDLEWARE

//Wenn wir im DEV mode sind soll geloggt werden mit morgan ,sonst nicht
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use((req, res, next) => {
  console.log('Hello from the Middleware');
  next();
});
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
app.use(express.static(`${__dirname}/public`));
//ROUTES
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//Wenn der code an diesen Punkt kommt konnten routen nich gefunden werden,
//deswegen kann man hier eine einbauen um alle nicht gefundenen abzufangen
app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this Server`, 404));
});
app.use(globalErrorHandler)
module.exports = app;
