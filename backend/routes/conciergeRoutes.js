const express = require('express');
const { registerConcierge } = require('../functions/registerConcierge'); // Import the registerConcierge function
const { getConcierges } = require('../functions/getConcierges'); // Import the getConcierge function
const { updateConcierge } = require ('../functions/update/updateConcierge');
const { addConciergeOrder} = require('../functions/frontDesk/addConciergeOrder');
const {getConciergesGuest} = require('../functions/frontDesk/getConciergeGuest');
const {getConciergeDetails} = require('../functions/frontDesk/getConciergeDetails');
const {updateConciergeStatus} = require('../functions/frontDesk/updateConciergeStatus');
const {getAllConciergeRecords} = require('../functions/frontDesk/getAllConciergeRecords')
const {getAllRooms} = require('../functions/frontDesk/getAllRoomsCL');
const router = express.Router();


router.post('/registerConcierge', registerConcierge);

router.get('/getConcierge', getConcierges);
// PUT request to update a food item
router.put('/updateConcierge/:concierge_id', updateConcierge);

router.post('/addConciergeOrder', addConciergeOrder);

router.get('/getConciergesGuest', getConciergesGuest);

router.get('/getConciergeDetails', getConciergeDetails);

router.put('/updateConciergeStatus', updateConciergeStatus);

router.get('/getAllConciergeRecords', getAllConciergeRecords);

router.get('/getAllRoomsCL', getAllRooms);


module.exports = router;
