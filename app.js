const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const mongooseSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();
//GLOBAL MIDDLEWARE
//Security http headers
app.use(helmet());
//Wenn wir im DEV mode sind soll geloggt werden mit morgan ,sonst nicht
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// mit sowas kann man seinen server davor schützen das er wegen zu vielen anfragen zusammenbricht
//oder zb auch gegen brute force
const limiter = rateLimit({
  //Wie viele Anfragen dürfen max gesendet werden
  max: 100,
  //pro stunde
  windowMs: 60 * 60 * 1000,
  message: 'To many request from this IP, please try again later',
});
app.use('/api', limiter);
//Body parser um den body auszulesen req.body
//man kann auch die größe der pakete begrenzen um zu verhinder das malware code oder sonstiges hzugefügt wird
app.use(
  express.json({
    limit: '10kb',
  })
);
// DATA Sanitasation gegen NOSQL / XSS
//Filter sowas wie $ aus den anfragen damit keine injections passieren können
app.use(mongooseSanitize());
//hilft gegegn malware html code
app.use(xss());
//gegen parameter pollution
app.use(
  hpp({
    //Hiermit kann man angeben welche parameter man noch kombinieren darf
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);
//Test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
//serving static files
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
app.use(globalErrorHandler);
module.exports = app;
