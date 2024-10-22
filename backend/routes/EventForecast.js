const express = require('express');
const router = express.Router();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// Supabase setup
const supabaseUrl = "https://cayfvgjakympxwknatco.supabase.co";
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNheWZ2Z2pha3ltcHh3a25hdGNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMzc4MDI3MCwiZXhwIjoyMDM5MzU2MjcwfQ.Wr1jpEbcUhAhfoWz4bH2FYvlz8kIgIKEcDIK7mjGq78';
const supabase = createClient(supabaseUrl, supabaseKey);

const flaskApiUrl = 'https://chic-endurance-production.up.railway.app';

router.post('/event_forecast', async (req, res) => {
  console.log("Received request for event forecasting");
  try {
    // Step 1: Fetch completed events from EVENT_RESERVATION
    const { data: completedEvents, error: fetchError } = await supabase
      .from('EVENT_RESERVATION')
      .select('event_date, event_type')
      .eq('event_status', 'COMPLETED');

    if (fetchError) {
      console.error(`Supabase error fetching events: ${fetchError.message}`);
      return res.status(500).json({ error: 'Error fetching events from database' });
    }

    // Step 2: Aggregate the data by month and event type
    const monthlyEvents = {};
    completedEvents.forEach(event => {
      const eventDate = new Date(event.event_date);
      const monthYear = `${eventDate.getFullYear()}-${eventDate.getMonth() + 1}`;
      const eventType = event.event_type;

      if (!monthlyEvents[monthYear]) {
        monthlyEvents[monthYear] = {};
      }

      if (!monthlyEvents[monthYear][eventType]) {
        monthlyEvents[monthYear][eventType] = 0;
      }

      monthlyEvents[monthYear][eventType] += 1;
    });

    // Prepare the data for forecasting
    const forecastData = [];
    Object.keys(monthlyEvents).forEach(month => {
      Object.keys(monthlyEvents[month]).forEach(type => {
        forecastData.push({
          ds: `${month}-01`,  // Prophet expects 'ds' as the date in YYYY-MM-DD format
          y: monthlyEvents[month][type],
          event_type: type,  // Include event type
          isHistorical: true // Mark this data as historical
        });
      });
    });

    // Step 3: Send the data to the Python Flask service for forecasting
    try {
      console.log("Sending data to Flask service for forecasting:", forecastData);
      const response = await axios.post(`${flaskApiUrl}/forecast?forecastType=event`, forecastData);
      console.log('Forecast Response:', response.data);

      // Step 4: Return the historical + forecasted data to frontend
      res.json([...forecastData, ...response.data]);
    } catch (axiosError) {
      console.error('Error communicating with Flask service:', axiosError.message);
      if (axiosError.response) {
        console.error('Flask service responded with:', axiosError.response.data);
      }
      res.status(500).json({ error: 'Failed to fetch forecast from Flask service' });
    }
  } catch (error) {
    console.error('General error in event forecasting:', error);
    res.status(500).json({ error: 'Internal server error during event forecasting' });
  }
});

module.exports = router;
