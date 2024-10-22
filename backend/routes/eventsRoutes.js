// routes/eventsRoutes.js

const express = require('express');
const { registerVenue } = require('../functions/registerVenue');
const { getVenue } = require('../functions/getVenue');
const { registerFoodPackage } = require('../functions/registerFoodPackage');
const { getFoodPackage } = require('../functions/getFoodPackage');
const { updateFoodPackage } = require ('../functions/update/updateFoodPackage')
const { updateVenue } = require ('../functions/update/updateVenue');

const { getEventReservations } = require ('../functions/guest/getEventReservations');
const { registerEventReservation } = require ('../functions/guest/registerEventReservation');
const { getActiveVenues } = require ('../functions/guest/getActiveVenues');
const { getActiveFoodPackages } = require ('../functions/guest/getActiveFoodPackages');
const {getEventReservationsAll} = require('../functions/frontDesk/getEventReservationsAll')

const{getEventReservationsByGuestId} =require('../functions/guest/getEventReservationsByGuesId');
const router = express.Router();

// Route for venue registration
router.post('/registerVenue', registerVenue);

// Route for retrieving all venues
router.get('/getVenue', getVenue);

// Route for registering a new food package
router.post('/registerFoodPackage', registerFoodPackage);

// Route for retrieving all food packages
router.get('/getFoodPackage', getFoodPackage);

// PUT request to update a food package
router.put('/updateFoodPackage/:event_fd_pckg_id', updateFoodPackage);

// PUT request to update a venue package
router.put('/updateVenue/:event_venue_id', updateVenue);

router.get('/getEventReservations', getEventReservations);

router.post('/registerEventReservation', registerEventReservation);

router.get('/getActiveVenues', getActiveVenues);

router.get('/getActiveFoodPackages', getActiveFoodPackages);

router.get('/getEventReservationsAll', getEventReservationsAll);

router.get('/getEventReservationsByGuestId',getEventReservationsByGuestId);
module.exports = router;


