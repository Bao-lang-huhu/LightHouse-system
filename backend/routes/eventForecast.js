const express = require('express');
const router = express.Router();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// Supabase Configuration
const supabaseUrl = "https://qerqnluaffgbdvlkygpa.supabase.co";
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnFubHVhZmZnYmR2bGt5Z3BhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDA1ODk1OCwiZXhwIjoyMDQ1NjM0OTU4fQ.MzOOYe1DktKd_3gQ8f-M5wyDCkIg_f_AQ8sHy88OXnA';
const supabase = createClient(supabaseUrl, supabaseKey);

// Flask API URL
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
            const monthYear = `${eventDate.getFullYear()}-${(eventDate.getMonth() + 1).toString().padStart(2, '0')}`;
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

        const forecastResults = [];
        for (const [eventType, data] of Object.entries(forecastData.reduce((acc, item) => {
            if (!acc[item.event_type]) acc[item.event_type] = [];
            acc[item.event_type].push(item);
            return acc;
        }, {}))) {
            if (data.length < 3) continue;

            const response = await axios.post(`${flaskApiUrl}/event_forecast`, data, {
                headers: { 'Content-Type': 'application/json' },
            });
            forecastResults.push(...response.data);
        }

        res.json([...forecastData, ...forecastResults]);
    } catch (error) {
        console.error("Error in event forecasting:", error.message);
        res.status(500).json({ error: "Internal server error." });
    }
});

module.exports = router;
