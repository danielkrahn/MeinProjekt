class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    //Wir erzeugen ein neues objekt, da wir sonst nur eine referenz auf das alte objekt erhalten und nicht wirklich ein neues objekt haben
    const queryObj = { ...this.queryString };

    //Gebe die parameter an die aus dem query gelöscht werden sollen
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    //Löscht die für uns nicht relevanten fields bzw die die fehler auslösen könnten.
    excludedFields.forEach((el) => delete queryObj[el]);

    //Aus dem query OBj wird ein String gemacht
    let queryStr = JSON.stringify(queryObj);

    //Damit queriing funktioniert brauchen wir ein $ vor sowas lte lte(lowerthen or equal), da dies die mongoDb operatoren sind
    //durch die RegEx unten wird der String genau nach diesen wörtern durchsucht
    //und dann num das selbe + $ ersetzt (Das $ brauche ich damit mongoose funktioniert)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    //console.log(JSON.parse(queryStr));
    //in req.query (oder in deisem Fall queryObj) ist quasi unser filterobjekt gespeichert, das wir nun zum suchen anweden können
    //wenn ich das anders schreibe ist das query nicht mehr veränderbar deswegen ohne await
    this.query = this.query.find(JSON.parse(queryStr));
    //console.log(this);
    return this;
  }

  sort() {
    //SORTIEREN
    //Falls ein sort Objekt im query steckt führe dieses aus
    if (this.queryString.sort) {
      //für die KOmmas im querry soll ein whitespace erzeigt werden,
      // damit auhc nach verschiedenen parametern gesucht werden kann
      const sortBy = this.queryString.sort.split(',').join(' ');
      //console.log(sortBy);
      //Mongoose hat die sort methode welches das sortieren für mich übernimmt,
      //es muss nur wissen nach welchem parameter es sortieren soll
      this.query = this.query.sort(sortBy);
    } else {
      //Als default soll es nach dem erstellungsdatum sortiert werden(ein -vorne dreht die anfrage um also auf und absteigend)
      this.query = this.query.sort('-creadedAt');
    }

    //console.log(this);
    return this;
  }

  limitFields() {
    //AUSWAHL BESTIMMTER FELDER
    //nur bestimmte felder zurücksenden um datenverkehr zu minimieren
    if (this.queryString.fields) {
      //für die KOmmas im querry soll ein whitespace erzeigt werden,
      // damit auhc nach verschiedenen parametern gesucht werden kann
      const fields = this.queryString.fields.split(',').join(' ');
      //console.log(fields);
      //Mongoose hat die sort methode welches das sortieren für mich übernimmt,
      //es muss nur wissen nach welchem parameter es sortieren soll
      this.query = this.query.select(fields);
    } else {
      //Als default soll es nach dem erstellungsdatum sortiert werden(ein -vorne schickt alles außer die angegeben paramter zurück
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    //PAGINANTION
    //*1 wird benutzt um Strings in numerische werte umzuwandeln
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    //Die zu skippenden objekte erschließen sich aus der seite mal dem limit s-B seite 3 müpssen 20 objekte geskippt werden 3-1 *10
    const skip = (page - 1) * limit;
    //skip sagt wie viele objekte übersprungen werden sollen limit wie viele angezeigt werden sollen
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = APIFeatures;
