const mongoose = require('mongoose');
const slugify = require('slugify');
//const User = require('./userModel');
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
    startLocation: {
      //GEOJSON
      type: {
        type: String,
        defaul: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      adress: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          defaul: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        adress: String,
        description: String,
      },
    ],
    guides: [
      //Damit sagen wir dem Programm, dass ich eine mogoose Id erwarte
      //muss auch wieder als objekt deklariert werden
      //So sind die User jetzt als ID referenziert und nicht mehr als komplettes Objekt gespeichert
      {
        type: mongoose.Schema.ObjectId,
        //hier werden die beiden Datenbanken miteinander verknüpft bzw. es wird gesagt wo die referenz zu der id zu finden ist
        ref: 'User',
      },
    ],
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

//diese methode "Embedded" meine User zu den Tours
//Embedded bedeued das das objekt mit drin steckt und nicht nur eine Referenz auf das Objekt drin steckt
// tourSchema.pre('save', async function (next) {
//   //da es mit await arbeitet bekommt die Funktion ein Promise zurückgeliefert
//   //d.H ich speichere gerade keine User sondern prmises muss ich noch konvertieren
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   //hier werden die Promises umgewandelt
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

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

//In dieser middleware werden aus den ids wieder richtige
//objekte gemacht dafür nutze ich die methode populate
tourSchema.pre(/^find/, function (next) {
  //this points to the current querry
  this.populate({
    //path sagt wo im user (der oben im schema verknüpft wurde) nach den infos gesucht werden soll
    path: 'guides',
    //diese felder werden nicht angezeigt
    select: '-__v -passwordChangedAt',
  });
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
