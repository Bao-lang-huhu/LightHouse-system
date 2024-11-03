const express = require('express');
const router = express.Router();
const axios = require('axios');
const { supabase } = require('../supabaseClient');
require('dotenv').config();

const totalRooms = 20;
const flaskApiUrl ='https://chic-endurance-production.up.railway.app';

router.post('/manager_forecast', async (req, res) => {
  try {
    const { data: reservationsData, error: reservationError } = await supabase
      .from('ROOM_RESERVATION')
      .select('room_check_in_date, room_check_out_date');

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
      const response = await axios.post(`${flaskApiUrl}/forecast`, { data: occupancyRates, months: 3 });
      const forecastedData = response.data.map((forecast, index) => ({
        ds: new Date(latestDate.getFullYear(), latestDate.getMonth() + index + 1, 1).toISOString().split('T')[0],
        y: forecast.yhat,
        isHistorical: false
      }));

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
