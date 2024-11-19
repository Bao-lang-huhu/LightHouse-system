const express = require('express');
const router = express.Router();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://qerqnluaffgbdvlkygpa.supabase.co";
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnFubHVhZmZnYmR2bGt5Z3BhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDA1ODk1OCwiZXhwIjoyMDQ1NjM0OTU4fQ.MzOOYe1DktKd_3gQ8f-M5wyDCkIg_f_AQ8sHy88OXnA';

const supabase = createClient(supabaseUrl, supabaseKey);

const flaskApiUrl = 'https://generous-optimism-production.up.railway.app';

router.post('/event_forecast', async (req, res) => {
  try {
    const { data: completedEvents, error } = await supabase
      .from('EVENT_RESERVATION')
      .select('event_date, event_type')
      .eq('event_status', 'COMPLETED');

    if (error) throw new Error(`Error fetching events: ${error.message}`);

    const monthlyEvents = {};
    completedEvents.forEach(event => {
      const eventDate = new Date(event.event_date);
      const monthYear = `${eventDate.getFullYear()}-${eventDate.getMonth() + 1}`;
      const eventType = event.event_type;

      if (!monthlyEvents[monthYear]) monthlyEvents[monthYear] = {};
      if (!monthlyEvents[monthYear][eventType]) monthlyEvents[monthYear][eventType] = 0;
      monthlyEvents[monthYear][eventType] += 1;
    });

    const forecastData = Object.entries(monthlyEvents).flatMap(([month, types]) =>
      Object.entries(types).map(([type, count]) => ({
        ds: `${month}-01`,
        y: count,
        event_type: type,
        isHistorical: true,
      }))
    );

    const latestDate = new Date(Math.max(...forecastData.map(d => new Date(d.ds))));

    const eventTypeGroups = forecastData.reduce((acc, item) => {
      if (!acc[item.event_type]) acc[item.event_type] = [];
      acc[item.event_type].push(item);
      return acc;
    }, {});

    const forecastResults = [];
    for (const [eventType, data] of Object.entries(eventTypeGroups)) {
      if (data.length < 3) continue;

      const response = await axios.post('https://generous-optimism-production.up.railway.app', data);
      forecastResults.push(...response.data);
    }

    res.json([...forecastData, ...forecastResults]);
  } catch (error) {
    console.error("Error in event forecasting:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;
