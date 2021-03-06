const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//Mit solchen Middleware Funktionen kann man ergebnisse vorfertigen, sodass der User sich nicht selbst darum kümmern muss
exports.aliasTop5 = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  //Ab hier wird es quasi ausgeführt
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await features.query;
  //console.log(tours);
  res.status(200).json({
    status: 'success',
    data: {
      results: tours.length,
      tours,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //holt sich das id field aus dem req da ich es beim routing als id gekennzeichnet habe d.H alles was nach dem / kommt wird in dioe variable id gesteckt
  //params habe ich aber noch nicht ganz verstanden muss ich mir evtl noch bisschen was zu anschauen
  //populate() macht aus id quas wieder die Objekte die wir referenziert haben in dem fall guides und darin die ids der user
  const tour = await Tour.findById(req.params.id);
  if (!tour) {
    //return statement damit funktion abgebrochen wird
    return next(new AppError('No Tour found with this ID', 404)); //Sobald next estwa übergeben bekommt geht es davon aus das es ein fehler ist uns springt zum fehler handling
  }
  //response wird als Json nachricht gesendet
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  //Aus dem Body werden die Daten geholt, die vorher im Schema der Tour festgelegt worden sind
  const newTour = await Tour.create(req.body);
  //Als Antwort wird das neue Tour Object übergeben
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  //findByIdAndUpdate sucht nach dem objekt und aktualisiert es. erster parameter ist die id zweiter was zu aktualisieren ist
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    //Um zu prüfen ob die eingebenen datentypen stimmen, sonst wird nicht kontrolliert und man könne alles mögliche eingeben
    runValidators: true,
  });
  if (!tour) {
    //return statement damit funktion abgebrochen wird
    return next(new AppError('No Tour found with this ID', 404)); //Sobald next estwa übergeben bekommt geht es davon aus das es ein fehler ist uns springt zum fehler handling
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  //findByIdAndUpdate sucht nach dem objekt und aktualisiert es. erster parameter ist die id zweiter was zu aktualisieren ist
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    //return statement damit funktion abgebrochen wird
    return next(new AppError('No Tour found with this ID', 404)); //Sobald next etwas übergeben bekommt geht es davon aus das es ein fehler ist uns springt zum fehler handling
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        //nach was soll sortiert werden
        _id: '$difficulty',
        //die $ sind operatoren von mongodb
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    //{
    //Damit excludiert man objekte
    //$match: { _id: { $ne: 'EASY' } },
    //},
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  //*1 um numerischen wert zu erhalten
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      //fügt touren unter gewissen parametern zusammen hier ein Zeitraum
      $match: {
        startDates: {
          //damit hole ich mir die ergebnisse des angegebenen Jahres, alles was in diesen Zeitraum fällt wird ausgegeben
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      //Gruppieren nach bestimmten parametern
      $group: {
        //Vorne operator : auf was soll es angewand werden
        _id: { $month: '$startDates' },
        //Zähler hochlaufen lassen
        numTourStarts: { $sum: 1 },
        //gibt den name der Tour aus
        tours: { $push: '$name' },
      },
    },
    {
      //fügt dem ganzen das Id feld hinzu
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        //mit 0 oder 1 kann man bestimmen ob gewisse Parameter ausgegebenw erden sollen oder nicht
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      //damit kann man einlimit angeben wie viele sachen ausgegeben werden sollen
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
