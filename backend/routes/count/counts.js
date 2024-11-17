const express = require('express');
const {  getYearlyDrinkOrders,getMonthlyDrinkOrders, getYearlyFoodOrders, getMonthlyFoodOrders } = require('../../functions/counts/getCounts');
const {getFoodOrdersComparison, getDrinkOrdersComparison} = require('../../functions/counts/getCountsUpdated');
const router = express.Router();

router.get('/getYearlyDrinkOrders', getYearlyDrinkOrders);
router.get('/getMonthlyDrinkOrders', getMonthlyDrinkOrders);

router.get('/getYearlyFoodOrders', getYearlyFoodOrders);
router.get('/getMonthlyFoodOrders', getMonthlyFoodOrders);

router.get('/getFoodOrdersComparison', getFoodOrdersComparison);
router.get('/getDrinkOrdersComparison', getDrinkOrdersComparison);
module.exports = router;
