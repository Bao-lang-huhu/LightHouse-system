const express = require('express');
const router = express.Router();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// Supabase setup
const supabaseUrl = "https://cayfvgjakympxwknatco.supabase.co";
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNheWZ2Z2pha3ltcHh3a25hdGNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMzc4MDI3MCwiZXhwIjoyMDM5MzU2MjcwfQ.Wr1jpEbcUhAhfoWz4bH2FYvlz8kIgIKEcDIK7mjGq78';  // Ensure you're using environment variables for sensitive data
const supabase = createClient(supabaseUrl, supabaseKey);


const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Ensure JSON parsing


const totalRooms = 20;

// Get the Flask API URL from environment variables
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
    const response = await axios.post(`${flaskApiUrl}/forecast`, occupancyRates);  // Use the dynamic URL
    console.log('Forecast Response:', response.data);

    // Step 7: Return the historical + forecasted data to frontend
    res.json([...occupancyRates, ...response.data]);
  } catch (error) {
    console.error('Error in forecasting:', error);
    res.status(500).json({ error: 'Failed to fetch forecast' });
  }
});

module.exports = router;
