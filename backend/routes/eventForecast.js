
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://cayfvgjakympxwknatco.supabase.co";
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNheWZ2Z2pha3ltcHh3a25hdGNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMzc4MDI3MCwiZXhwIjoyMDM5MzU2MjcwfQ.Wr1jpEbcUhAhfoWz4bH2FYvlz8kIgIKEcDIK7mjGq78';
const supabase = createClient(supabaseUrl, supabaseKey);

const flaskApiUrl = 'https://chic-endurance-production.up.railway.app';

router.post('/event_forecast', async (req, res) => {
  console.log("Received request for event forecasting");
  try {
    const { data: completedEvents, error: fetchError } = await supabase
      .from('EVENT_RESERVATION')
      .select('event_date, event_type')
      .eq('event_status', 'COMPLETED');

    if (fetchError) {
      console.error(`Supabase error fetching events: ${fetchError.message}`);
      return res.status(500).json({ error: 'Error fetching events from database' });
    }

    const monthlyEvents = {};
    let latestDate = null;

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

      if (!latestDate || eventDate > latestDate) {
        latestDate = eventDate;
      }
    });

    const forecastData = [];
    Object.keys(monthlyEvents).forEach(month => {
      Object.keys(monthlyEvents[month]).forEach(type => {
        forecastData.push({
          ds: `${month}-01`,
          y: monthlyEvents[month][type],
          event_type: type,
          isHistorical: true
        });
      });
    });

    const nextMonthDate = new Date(latestDate);
    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
    const nextMonth = `${nextMonthDate.getFullYear()}-${nextMonthDate.getMonth() + 1}-01`;

    try {
      console.log("Sending data to Flask service for forecasting:", forecastData);

      const eventTypeGroups = forecastData.reduce((acc, item) => {
        if (!acc[item.event_type]) {
          acc[item.event_type] = [];
        }
        acc[item.event_type].push(item);
        return acc;
      }, {});

      const forecastResults = [];

      for (const [eventType, data] of Object.entries(eventTypeGroups)) {
        if (data.length < 2) {
          console.log(`Skipping forecast for ${eventType} due to insufficient data`);
          continue;
        }

        try {
          const response = await axios.post(`${flaskApiUrl}/forecast`, data);
          const forecastedItems = response.data.map(forecast => ({
            ds: nextMonth,
            y: forecast.yhat,
            event_type: eventType,
            isHistorical: false
          }));
          forecastResults.push(...forecastedItems);
        } catch (axiosError) {
          if (axiosError.response && axiosError.response.status === 404) {
            console.log(`No forecast data available for ${eventType}. Skipping.`);
            continue;
          } else {
            throw axiosError;
          }
        }
      }

      res.json([...forecastData, ...forecastResults]);
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