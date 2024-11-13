const express = require('express');
const router = express.Router();
const axios = require('axios');
const { supabase } = require('../supabaseClient');
require('dotenv').config();

const totalRooms = 20;
const flaskApiUrl = 'https://generous-optimism-production.up.railway.app';

router.post('/manager_forecast', async (req, res) => {
  try {
    // First, fetch CHECK_IN data with 'COMPLETED' payment status and join with ROOM_RESERVATION
    const { data: checkInData, error: checkInError } = await supabase
      .from('CHECK_IN')
      .select('room_reservation_id, payment_status')
      .eq('payment_status', 'PAID');

    if (checkInError) {
      console.error('Supabase CHECK_IN error:', checkInError.message);
      return res.status(500).json({ error: `Supabase CHECK_IN error: ${checkInError.message}` });
    }

    // Extract room_reservation_ids with completed payments
    const completedReservationIds = checkInData.map(entry => entry.room_reservation_id);

    // Fetch room reservation data only for completed payment statuses
    const { data: reservationsData, error: reservationError } = await supabase
      .from('ROOM_RESERVATION')
      .select('room_check_in_date, room_check_out_date, room_reservation_id')
      .in('room_reservation_id', completedReservationIds);

    if (reservationError) {
      console.error('Supabase ROOM_RESERVATION error:', reservationError.message);
      return res.status(500).json({ error: `Supabase ROOM_RESERVATION error: ${reservationError.message}` });
    }

    // Calculate daily occupancy
    const dailyOccupancy = {};
    reservationsData.forEach(reservation => {
      const checkInDate = new Date(reservation.room_check_in_date);
      const checkOutDate = new Date(reservation.room_check_out_date);

      for (let d = checkInDate; d <= checkOutDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        dailyOccupancy[dateStr] = (dailyOccupancy[dateStr] || 0) + 1;
      }
    });

    // Aggregate daily occupancy into monthly occupancy
    const monthlyOccupancy = {};
    Object.keys(dailyOccupancy).forEach(dateStr => {
      const date = new Date(dateStr);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (!monthlyOccupancy[monthYear]) monthlyOccupancy[monthYear] = 0;
      monthlyOccupancy[monthYear] += dailyOccupancy[dateStr];
    });

    // Calculate occupancy rates per month
    const occupancyRates = Object.entries(monthlyOccupancy).map(([month, roomsOccupied]) => {
      const daysInMonth = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate();
      const occupancyRate = (roomsOccupied / (totalRooms * daysInMonth)) * 100;
      return {
        ds: `${month}-01`,
        y: occupancyRate,
        isHistorical: true
      };
    });

    // Get the last historical date and calculate the start of the next month
    const lastHistoricalDate = new Date(Math.max(...occupancyRates.map(item => new Date(item.ds))));
    const nextMonthStart = new Date(lastHistoricalDate);
    nextMonthStart.setMonth(lastHistoricalDate.getMonth() + 1);

    // Fetch forecasted data from the external API
    try {
      const response = await axios.post(`${flaskApiUrl}/forecast`, occupancyRates, {
        headers: { 'Content-Type': 'application/json' },
        params: { months: 3 }
      });
      const forecastedData = response.data
        .filter(forecast => new Date(forecast.ds) >= nextMonthStart)
        .map(forecast => ({
          ds: forecast.ds,
          y: forecast.yhat,
          isHistorical: false
        }));

      res.json([...occupancyRates, ...forecastedData]);
    } catch (axiosError) {
      console.error('Failed to fetch forecast:', axiosError.response ? axiosError.response.data : axiosError.message);
      res.status(500).json({ error: 'Failed to fetch forecast' });
    }
  } catch (error) {
    console.error('Error in forecasting:', error);
    res.status(500).json({ error: 'Failed to fetch forecast' });
  }
});

module.exports = router;
