// backend/routes/guestRoutes.js
const express = require('express');
const { registerGuest } = require('../functions/registerGuest');
const { getGuests } = require('../functions/getGuests');
const { loginGuest } = require('../functions/loginGuest');
const { getGuestDetails } = require('../functions/guest/getGuestDetails');
const { updateGuest } = require('../functions/guest/updateGuest');
const { getReservationsByReservationId } = require('../functions/guest/getReservationsByReservationId');
const { getReservationsByGuestId } = require('../functions/guest/getReservationByGuestId');
const { cancelReservation } = require('../functions/guest/cancelReservation');
const { getTableRevByGuestID } = require('../functions/guest/getTableRevByGuestID');
const { cancelTableReservation } = require('../functions/guest/cancelTableReservation');
const { updateAccount } = require ('../functions/update/updateAccount');
const {getEventReservationsAll} = require('../functions/frontDesk/getEventReservationsAll');
const {cancelEventReservation } = require ('../functions/guest/cancelEventReservation');

const { getVirtualTours } = require('../functions/guest/getVirtualTours');
const { registerRoomVT } = require('../functions/guest/registerRoomVT');
const { getRoomVirtualTourByTypeName, updateRoomVT} = require ('../functions/guest/updateRoomVT');
const { getTours } = require('../functions/guest/getTours');
const { getRoomVT } = require('../functions/guest/getRoomVT');
const router = express.Router();

router.post('/registerGuest', registerGuest);

router.get('/getGuests', getGuests);

router.post('/loginGuest', loginGuest);

router.get('/getGuestDetails', getGuestDetails);

router.put('/updateGuest', updateGuest);

router.get('/getReservationsByGuestId', getReservationsByGuestId);

router.get('/getReservationsByReservationId',getReservationsByReservationId);

router.post('/cancelReservation', cancelReservation);

router.get('/getTableRevByGuestID', getTableRevByGuestID);

router.post('/cancelTableReservation', cancelTableReservation);

router.put('/update_account/:guest_id', updateAccount);

router.get('/getEventReservationsAll/:event_reservation_id', getEventReservationsAll);

router.post('/cancelEventReservation', cancelEventReservation);

router.get('/getVirtualTours/:room_id', getVirtualTours);

router.post('/registerRoomVt', registerRoomVT);

router.put('/updateRoomVT', updateRoomVT);

router.get('/getRoomVirtualTourByTypeName', getRoomVirtualTourByTypeName);

router.get('/getRoomVT', getRoomVT);

router.get('/getTours', getTours);

module.exports = router;
