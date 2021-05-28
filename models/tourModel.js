const mongoose = require('mongoose');
const slugify = require('slugify');
//const validator = require('validator');
//Schema um eine Tour anzulegen 'Bauplan' für eine Tour
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      //required sagt das ein objekt vorausgesetzt wird der zweite teil im string ist die NAchricht,
      //die der Error ausgibt, wenn das feld nicht ausgefüllt wurde
      required: [true, 'A Tour must have a Name'],
      unique: true,
      maxlength: [40, 'A name cannot have more then 40 Charakters'],
      minlength: [10, 'A name cannot have less then 10 Charakters'],
      //checkt ob name nur aus buchstaben besteht kommt aus der validator class
      //validate: [validator.isAlpha, 'Tour Name must only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A Tour must habe a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A Tour must have a max Group Size '],
    },
    difficulty: {
      type: String,
      required: [true, 'A Tour must have a difficulty'],
      //dieser Parameter gibt an welche Optionen verwendet werden können
      //andere werden nicht validiert
      enum: {
        values: ['easy', 'medium', 'difficult'],

        message: 'This is not an keyword for difficulty',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'The minimum rating is 1'],
      max: [5, 'The max rating is 5'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      //Man kann auch eigene Funktionen zum Validieren bauen
      //Funktioniert aber nicht bei UPDATE, da wir ein .this in der Funktion verwenden
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount({VALUE}) cant be bigger then Price',
      },
    },
    summary: {
      type: String,
      //Entfernt leerzeichen am Ende und Beginn des Strings
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A Tour must have a Picture'],
    },

    //Die eckigen Klammern besagen, dass hier ein String übergeben wird
    images: [String],

    createdAt: {
      type: Date,
      default: Date.now(),
      //wird nicht an den client gesendet
      select: false,
    },
    startDates: [Date],

    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    //Damit werden die Virtual Properties hinzugefügt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
//Da ich ein this brauche normale funktion
//Virtual Properties können nicht im query verwendet werden!
tourSchema.virtual('durationWeeks').get(function () {
  //duration gibt die tage an deswegen nochmal durch 7 teilen
  return this.duration / 7;
});

//DOCUMENT MIDDLEWARE
//läuft vor safe() und create() nicht vor update
//dh wir können sie noch manipulieren bevor sie gespeichert wird
//Hier wird ein SLug erstellt dh ein lesbarerer link als zb die id den man an die URL
//packen kjann zb tours/test-tour-2
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//In so einer funktion wird das Document nach allen anderen funktionen bearbeitet bzw, nach dem safe event
tourSchema.post('save', (doc, next) => {
  //console.log(doc);
  next();
});

//QUERYMIDDLEWARE
//RegEx gibt an, dass alle functionen die mit find starten diese Middleware triggern
tourSchema.pre(/^find/, function (next) {
  //this zeigt auf das query Object
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
//Diese Middleware läuft nach dem das query ausgeführt wurde
//dh es hat zugang zu den gesuchten dokumenten, da der query schon ausgeführt wurde
tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start}milliseconds`);
  next();
});

//AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  //unshift fügt ein objekt an den anfang eines arrays hinzu
  //damit werden alle touren die secret sind ausgefiltert
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});
//Tour Object wird erstellt
//Ueber Tour Object können nun eigene Tour Objekte erstellt werden
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
