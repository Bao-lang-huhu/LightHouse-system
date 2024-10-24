const express = require('express');
const { getRoomSales } = require('../functions/getRoomSales');
const { getEventSales } = require('../functions/getEventSales');
const { getRestaurantSales } = require('../functions/getRestaurantSales');
const { getBarSales } = require('../functions/getBarSales'); // Import the new function
const router = express.Router();

router.get('/room_sales', getRoomSales);
router.get('/event_sales', getEventSales);
router.get('/restaurant_sales', getRestaurantSales);
router.get('/bar_sales', getBarSales); // Add new route

module.exports = router;
