const express = require('express');
const router = express.Router();
const axios = require('axios');
const { supabase } = require('../supabaseClient'); // Ensure this path matches your file structure
require('dotenv').config(); // Load environment variables

const totalRooms = 20;
const flaskApiUrl = process.env.FLASK_API_URL || 'https://light-house-system-h74t-server.vercel.app';

router.post('/manager_forecast', async (req, res) => {
  try {
    // Step 1: Fetch the latest room_check_in_date from ROOM_RESERVATION
    const { data: latestReservation, error: latestError } = await supabase
      .from('ROOM_RESERVATION')
      .select('room_check_in_date')
      .order('room_check_in_date', { ascending: false })
      .limit(1);

    if (latestError) {
      throw new Error(`Supabase ROOM_RESERVATION error: ${latestError.message}`);
    }

    if (!latestReservation || latestReservation.length === 0) {
      return res.status(404).json({ error: 'No room reservation data found.' });
    }

    const latestDate = new Date(latestReservation[0].room_check_in_date);

    // Step 2: Calculate the date from five months ago
    const fiveMonthsAgo = new Date(latestDate);
    fiveMonthsAgo.setMonth(latestDate.getMonth() - 5);

    // Step 3: Fetch room reservation data from the last 5 months
    const { data: reservationsData, error: reservationError } = await supabase
      .from('ROOM_RESERVATION')
      .select('room_check_in_date, room_check_out_date')
      .gt('room_check_in_date', fiveMonthsAgo.toISOString());

    if (reservationError) {
      throw new Error(`Supabase ROOM_RESERVATION error: ${reservationError.message}`);
    }

    // Step 4: Calculate the number of days each guest stayed
    const dailyOccupancy = {};
    reservationsData.forEach(reservation => {
      const checkInDate = new Date(reservation.room_check_in_date);
      const checkOutDate = new Date(reservation.room_check_out_date);

      for (let d = checkInDate; d <= checkOutDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        dailyOccupancy[dateStr] = (dailyOccupancy[dateStr] || 0) + 1;
      }
    });

    // Step 5: Aggregate the data by month and calculate the occupancy rate
    const monthlyOccupancy = {};
    Object.keys(dailyOccupancy).forEach(dateStr => {
      const date = new Date(dateStr);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;

      if (!monthlyOccupancy[monthYear]) {
        monthlyOccupancy[monthYear] = 0;
      }

      monthlyOccupancy[monthYear] += dailyOccupancy[dateStr];
    });

    // Calculate the occupancy rate per month
    const occupancyRates = Object.entries(monthlyOccupancy).map(([month, roomsOccupied]) => {
      const daysInMonth = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate();
      const occupancyRate = (roomsOccupied / (totalRooms * daysInMonth)) * 100;
      return {
        ds: `${month}-01`,  // Prophet expects 'ds' as the date in YYYY-MM-DD format
        y: occupancyRate,
        isHistorical: true // Mark this data as historical
      };
    });

    // Step 6: Send the occupancy rate data to the Python Flask service for forecasting
    try {
      const response = await axios.post(`${flaskApiUrl}/forecast`, occupancyRates);  // Use the dynamic URL
      console.log('Forecast Response:', response.data);

      // Step 7: Return the historical + forecasted data to frontend
      res.json([...occupancyRates, ...response.data]);
    } catch (axiosError) {
      if (axiosError.response) {
        // Request made and server responded
        console.error('Response error:', axiosError.response.data);
        console.error('Status:', axiosError.response.status);
        console.error('Headers:', axiosError.response.headers);
      } else if (axiosError.request) {
        // Request made but no response received
        console.error('No response received:', axiosError.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Axios Error:', axiosError.message);
      }
      res.status(500).json({ error: 'Failed to fetch forecast' });
    }
  } catch (error) {
    console.error('Error in forecasting:', error);
    res.status(500).json({ error: 'Failed to fetch forecast' });
  }
});

module.exports = router;
