const express = require('express');
const router = express.Router();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// Supabase Configuration
/*const supabaseUrl = "https://qerqnluaffgbdvlkygpa.supabase.co";
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnFubHVhZmZnYmR2bGt5Z3BhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDA1ODk1OCwiZXhwIjoyMDQ1NjM0OTU4fQ.MzOOYe1DktKd_3gQ8f-M5wyDCkIg_f_AQ8sHy88OXnA';
*/
const supabaseUrl = "https://wrhuphjctglbnbpqtequ.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyaHVwaGpjdGdsYm5icHF0ZXF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIxOTEzNTksImV4cCI6MjA0Nzc2NzM1OX0.KSX_5tOq_foiefmmUZNmbpwnZzqIC5VIQeiJH2WsNow";

const flaskApiUrl = 'http://127.0.0.1:8080';
const supabase = createClient(supabaseUrl, supabaseKey);

router.post("/event_forecast", async (req, res) => {
    try {
        // Fetch completed events from Supabase
        const { data: completedEvents, error } = await supabase
            .from("EVENT_RESERVATION")
            .select("event_date, event_type")
            .eq("event_status", "COMPLETED");

        if (error) throw new Error(`Error fetching events: ${error.message}`);
        if (!completedEvents || completedEvents.length < 3) {
            return res
                .status(400)
                .json({ error: "Insufficient data to perform forecasting." });
        }

        // Aggregate data by month and event type
        const aggregatedData = completedEvents.reduce((acc, event) => {
            const eventDate = new Date(event.event_date);
            const monthYear = `${eventDate.getFullYear()}-${(eventDate.getMonth() + 1)
                .toString()
                .padStart(2, "0")}`;
            const eventType = event.event_type;

            const key = `${monthYear}-${eventType}`;
            if (!acc[key]) {
                acc[key] = {
                    ds: `${monthYear}-01`,
                    y: 0,
                    event_type: eventType,
                    isHistorical: true, // Mark all aggregated data as historical initially
                };
            }
            acc[key].y += 1; // Increment count for the month and event type
            return acc;
        }, {});

        const formattedData = Object.values(aggregatedData);

        // Sort data by date
        formattedData.sort((a, b) => new Date(a.ds) - new Date(b.ds));

        // Calculate warmup (1/3 oldest months) and forecast (2/3 and beyond)
        const warmupCutoff = Math.floor(formattedData.length / 3);
        const warmupData = formattedData.slice(0, warmupCutoff);
        const forecastData = formattedData.slice(warmupCutoff);

        // Add 3 months of additional forecast dates
        const latestDate = new Date(formattedData[formattedData.length - 1].ds);
        for (let i = 1; i <= 3; i++) {
            const futureDate = new Date(latestDate);
            futureDate.setMonth(latestDate.getMonth() + i);

            const monthYear = `${futureDate.getFullYear()}-${(futureDate.getMonth() + 1)
                .toString()
                .padStart(2, "0")}`;

            forecastData.push({
                ds: `${monthYear}-01`,
                y: 0, // Placeholder; Flask will calculate this
                event_type: "FORECAST", // Assign a generic event type for new forecast dates
                isHistorical: false, // Mark these entries as forecasted
            });
        }

        // Send warmup and forecast data to Flask
        const response = await axios.post(
            `${flaskApiUrl}/event_forecast`,
            { warmupData, forecastData },
            { headers: { "Content-Type": "application/json" } }
        );

        // Combine and filter out warmup data from the final response
        const finalData = [
            ...formattedData.slice(warmupCutoff), // Include only non-warmup historical data
            ...response.data, // Append forecasted data from Flask
        ];

        // Return combined historical (excluding warmup) and forecasted data
        res.json(finalData);
    } catch (error) {
        console.error("Error calling Flask API:", error.message);
        res.status(500).json({ error: "Error calling Flask API." });
    }
});


module.exports = router;