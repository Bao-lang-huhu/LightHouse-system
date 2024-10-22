const express = require('express');
const {  getYearlyDrinkOrders,getMonthlyDrinkOrders, getYearlyFoodOrders, getMonthlyFoodOrders } = require('../../functions/counts/getCounts');
const router = express.Router();

router.get('/getYearlyDrinkOrders', getYearlyDrinkOrders);
router.get('/getMonthlyDrinkOrders', getMonthlyDrinkOrders);

router.get('/getYearlyFoodOrders', getYearlyFoodOrders);
router.get('/getMonthlyFoodOrders', getMonthlyFoodOrders);

module.exports = router;
