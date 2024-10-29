const express = require('express');
const router = express.Router();
const axios = require('axios');
const { supabase } = require('../supabaseClient');
require('dotenv').config();

const totalRooms = 20;
const flaskApiUrl = 'https://chic-endurance-production.up.railway.app';

router.post('/manager_forecast', async (req, res) => {
  try {
    // Step 1: Fetch the latest room_check_in_date from ROOM_RESERVATION
    const { data: latestReservation, error: latestError } = await supabase
      .from('ROOM_RESERVATION')
      .select('room_check_in_date')
      .order('room_check_in_date', { ascending: false })
      .limit(1);

    if (latestError) {
      console.error('Supabase ROOM_RESERVATION error:', latestError.message);
      return res.status(500).json({ error: `Supabase ROOM_RESERVATION error: ${latestError.message}` });
    }

    if (!latestReservation || latestReservation.length === 0) {
      return res.status(404).json({ error: 'No room reservation data found.' });
    }

    const latestDate = new Date(latestReservation[0].room_check_in_date);
    const fiveMonthsAgo = new Date(latestDate);
    fiveMonthsAgo.setMonth(latestDate.getMonth() - 5);

    // Step 3: Fetch room reservation data from the last 5 months
    const { data: reservationsData, error: reservationError } = await supabase
      .from('ROOM_RESERVATION')
      .select('room_check_in_date, room_check_out_date')
      .gt('room_check_in_date', fiveMonthsAgo.toISOString());

    if (reservationError) {
      console.error('Supabase ROOM_RESERVATION error:', reservationError.message);
      return res.status(500).json({ error: `Supabase ROOM_RESERVATION error: ${reservationError.message}` });
    }

    const dailyOccupancy = {};
    reservationsData.forEach(reservation => {
      const checkInDate = new Date(reservation.room_check_in_date);
      const checkOutDate = new Date(reservation.room_check_out_date);

      for (let d = checkInDate; d <= checkOutDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        dailyOccupancy[dateStr] = (dailyOccupancy[dateStr] || 0) + 1;
      }
    });

    const monthlyOccupancy = {};
    Object.keys(dailyOccupancy).forEach(dateStr => {
      const date = new Date(dateStr);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;

      if (!monthlyOccupancy[monthYear]) {
        monthlyOccupancy[monthYear] = 0;
      }

      monthlyOccupancy[monthYear] += dailyOccupancy[dateStr];
    });

    const occupancyRates = Object.entries(monthlyOccupancy).map(([month, roomsOccupied]) => {
      const daysInMonth = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate();
      const occupancyRate = (roomsOccupied / (totalRooms * daysInMonth)) * 100;
      return {
        ds: `${month}-01`,
        y: occupancyRate,
        isHistorical: true
      };
    });

    try {
      const response = await axios.post(`${flaskApiUrl}/forecast`, occupancyRates);
      const forecastedData = response.data.map(forecast => ({
        ...forecast,
        y: forecast.yhat,  // Ensure `y` is consistent
        isHistorical: false // Set forecasted data flag
      }));

      console.log('Forecast Response:', forecastedData);

      res.json([...occupancyRates, ...forecastedData]);
    } catch (axiosError) {
      console.error('Failed to fetch forecast:', axiosError.message);
      res.status(500).json({ error: 'Failed to fetch forecast' });
    }
  } catch (error) {
    console.error('Error in forecasting:', error);
    res.status(500).json({ error: 'Failed to fetch forecast' });
  }
});

module.exports = router;
