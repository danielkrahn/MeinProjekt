const express = require('express');

const router = express.Router();
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
//Beispiel für eine besondere seite
//alias middleware um das query so zu manipulieren, dass uns die richtigen touren ausgegeben werden
router
  .route('/top-5-cheap')
  .get(tourController.aliasTop5, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
//:year gibt einen parameter an mit dem wir nachher arbeiten wollen
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
// Falls das angegebene Parameter mit übergeben wird wird diese funktion ausgeführt in dem Fall iD, danach wird die FUNKTION CHECK ID AUFGERUFEN
//param filtert dinge in dem Fall iD
//router.param('id', tourController.checkID);
//So kann man die routen zu einem 'Link' umwandeln was leichter zu warten ist
// MAn kann Middelware hintereinanderstellen und sie so nach und nach durchgehen lassen zb um zu kontrollieren ob gültige werte genutzt werden usw.
router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

//Es gibt zwei routen, da bei manchen funktionen eine spezielle ID gefragt ist ,wie wenn man z.b nur eine Tour haben will, oder eine bestimmte tour updaten will oder löschen etc.
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );
module.exports = router;
