// laundryRoutes.js
const express = require('express');
const { registerLaundry } = require('../functions/registerLaundry');
const { getLaundry } = require('../functions/getLaundry');
const { updateLaundry } = require('../functions/update/updateLaundry')
const {addLaundryOrder} = require('../functions/frontDesk/addLaundryOrder')
const {getLaundryGuest} = require ('../functions/frontDesk/getLaundryGuest');
const {getLaundryDetails} =require('../functions/frontDesk/getLaundryDetails');
const {updateLaundryStatus} = require('../functions/frontDesk/updateLaundryStatus');
const {getAllLaundryRecords} = require ('../functions/frontDesk/getAllLaundryRecords');
const router = express.Router();

// Route for laundry item registration
router.post('/registerLaundry', registerLaundry);

// Route for retrieving all laundry items
router.get('/getLaundry', getLaundry);

// Route for updating laundry details
router.put('/updateLaundry/:laundry_id', updateLaundry);

router.post('/addLaundryOrder', addLaundryOrder);

router.get('/getLaundryGuest', getLaundryGuest);

router.get('/getLaundryDetails', getLaundryDetails);

router.put('/updateLaundryStatus', updateLaundryStatus);

router.get('/getAllLaundryRecords', getAllLaundryRecords);

module.exports = router;
