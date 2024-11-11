const express = require('express');
const router = express.Router();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://qerqnluaffgbdvlkygpa.supabase.co";
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnFubHVhZmZnYmR2bGt5Z3BhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDA1ODk1OCwiZXhwIjoyMDQ1NjM0OTU4fQ.MzOOYe1DktKd_3gQ8f-M5wyDCkIg_f_AQ8sHy88OXnA';

const supabase = createClient(supabaseUrl, supabaseKey);

const flaskApiUrl = 'https://generous-optimism-production.up.railway.app';

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

    console.log("Completed Events from Supabase:", completedEvents);

    // Aggregate historical data by month and event type
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

    console.log("Aggregated Historical Data:", forecastData);

    const latestHistoricalDate = new Date(Math.max(...forecastData.map(d => new Date(d.ds))));
    console.log("Latest Historical Date:", latestHistoricalDate);

    const eventTypeGroups = forecastData.reduce((acc, item) => {
      if (!acc[item.event_type]) {
        acc[item.event_type] = [];
      }
      acc[item.event_type].push(item);
      return acc;
    }, {});

    let forecastResults = [];
    for (const [eventType, data] of Object.entries(eventTypeGroups)) {
      if (data.length < 2) {
        console.log(`Skipping forecast for ${eventType} due to insufficient data`);
        continue;
      }

      try {
        const response = await axios.post(`${flaskApiUrl}/forecast`, data, { params: { months: 3 } });
        const forecastedItems = response.data
          .filter(forecast => new Date(forecast.ds) > latestHistoricalDate && forecast.yhat !== undefined)
          .map(forecast => ({
            ds: forecast.ds,
            y: forecast.yhat,
            event_type: eventType,
            isHistorical: false
          }));

        console.log(`Forecasted Items for ${eventType}:`, forecastedItems);
        forecastResults.push(...forecastedItems);
      } catch (axiosError) {
        if (axiosError.response && axiosError.response.status === 404) {
          console.log(`No forecast data available for ${eventType}. Skipping.`);
        } else {
          throw axiosError;
        }
      }
    }

    // Aggregate forecast results by month and event type
    forecastResults = forecastResults.reduce((acc, item) => {
      const key = `${item.ds}-${item.event_type}`;
      if (!acc[key]) {
        acc[key] = { ...item }; // If no entry exists, create one
      } else {
        acc[key].y += item.y; // If entry exists, sum the forecast values
      }
      return acc;
    }, {});

    forecastResults = Object.values(forecastResults);

    console.log("Aggregated Forecast Results:", forecastResults);

    const combinedData = [...forecastData, ...forecastResults];
    console.log("Combined Data for Response:", combinedData);
    res.json(combinedData);
  } catch (error) {
    console.error('General error in event forecasting:', error);
    res.status(500).json({ error: 'Internal server error during event forecasting' });
  }
});

module.exports = router;