const express = require('express');
const { registerRoom } = require('../functions/registerRoom');
const { getRooms } = require('../functions/getRooms');
const { getRoomList } = require('../functions/getRoomList');
const { getRoomReservations } = require('../functions/getRoomReservations');
const { updateRoom } = require('../functions/update/updateRoom');
const { registerRoomPhotos } = require ('../functions/registerRoomPhotos')

const{ getMainRoomPhotos} = require('../functions/getMainRoomPhotos');
const {getRoomsAll} = require('../functions/getRoomsAll');
const {checkRoomAvailability} = require ('../functions/guest/checkRoomAvailability');
const {registerRoomReservation} = require('../functions/registerRoomReservation')
const {getRoomsOrder} = require('../functions/guest/getRoomsOrder');
const {getRoomPhotos} = require('../functions/getRoomPhotos');
const { updateRoomPhoto } = require('../functions/update/updateRoomPhoto');

const {getRoomReservationsAll } = require('../functions/frontDesk/getRoomReservationsAll');
const {updateRoomReservation} = require('../functions/frontDesk/updateRoomReservation');
const {getCheckInData} = require('../functions/frontDesk/getCheckInData')
const {getRoomDetailsByRoomId} = require ('../functions/guest/getRoomDetailsByRoomId');

const {registerGuestRoom} = require ('../functions/registerGuestRoom');

const {getCheckIn} = require('../functions/frontDesk/getCheckIn');

const {getCheckInBill} = require('../functions/frontDesk/getCheckInBill');
const {updateCheckOut } = require('../functions/frontDesk/updateCheckOut');
const {getAdditionalItems} = require('../functions/frontDesk/getAdditionalItems');
const { getAdditionalItemsById } = require('../functions/frontDesk/getAdditionalItemsById');
const {EditAdditionalItem } = require('../functions/frontDesk/updateAdditionalItems');
const {returnAdditionalItem} = require('../functions/frontDesk/returnAdditionalItem');
const { archiveAdditionalItem } = require('../functions/frontDesk/archiveAdditionalItem');
const {getAllRoomsCheckedIn} = require('../functions/frontDesk/getAllRoomsCheckedIn');
const router = express.Router();

// Route for room registration
router.post('/registerRoom', registerRoom);

// Route for retrieving all rooms
router.get('/getRooms', getRooms);

// Route for retrieving all room lists
router.get('/getRoomList', getRoomList);

// Route for retrieving all room reservations
router.get('/getRoomReservations', getRoomReservations);

// Route for updating room details
router.put('/updateRoom/:id', updateRoom);

router.get('/getMainRoomPhotos', getMainRoomPhotos);

router.get('/getRoomPhotos', getRoomPhotos);

router.post('/registerRoomPhotos', registerRoomPhotos);

router.get('/getRoomsAll', getRoomsAll);

router.post('/registerRoomReservation', registerRoomReservation);

router.get('/checkRoomAvailability', checkRoomAvailability);

router.get('/getRoomsOrder', getRoomsOrder );

router.put('/updateRoomPhoto', updateRoomPhoto);

router.get('/getRoomReservationsAll', getRoomReservationsAll);

router.put('/updateRoomReservation/:room_reservation_id', updateRoomReservation);

router.get('/getCheckInData',getCheckInData);

router.get('/room_details/:room_id', getRoomDetailsByRoomId);

router.post('/registerGuestRoom', registerGuestRoom);

router.get('/getCheckIn', getCheckIn);

router.get('/getCheckInBill', getCheckInBill);

router.put('/updateCheckOut', updateCheckOut);

router.get('/getAdditionalItems', getAdditionalItems);

router.get('/getAdditionalItemsById/:add_item_id', getAdditionalItemsById);

router.put('/editAdditionalItem/:add_item_id', EditAdditionalItem);

router.put('/returnAdditionalItem/:add_item_id', returnAdditionalItem);

router.put('/archiveAdditionalItem/:addItemId', archiveAdditionalItem);

router.get('/getAllRoomsCheckedIn', getAllRoomsCheckedIn);

module.exports = router;
