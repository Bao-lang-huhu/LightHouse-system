const express = require('express');
const { getRoomSales } = require('../functions/reports/getRoomSales');
const { getEventSales } = require('../functions/reports/getEventSales');
const { getRestaurantSales } = require('../functions/reports/getRestaurantSales');
const { getBarSales } = require('../functions/reports/getBarSales'); // Import the new function
const router = express.Router();

router.get('/room_sales', getRoomSales);
router.get('/event_sales', getEventSales);
router.get('/restaurant_sales', getRestaurantSales);
router.get('/bar_sales', getBarSales); // Add new route

module.exports = router;
