const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Supabase Configuration
    const supabaseUrl = "https://wrhuphjctglbnbpqtequ.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyaHVwaGpjdGdsYm5icHF0ZXF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIxOTEzNTksImV4cCI6MjA0Nzc2NzM1OX0.KSX_5tOq_foiefmmUZNmbpwnZzqIC5VIQeiJH2WsNow";

const supabase = createClient(supabaseUrl, supabaseKey);

const eventTypes = ["ANNIVERSARY", "WEDDING", "BIRTHDAY", "CHRISTMAS", "EXHIBITION", "SEMINAR"];

// Function to generate a seasonal random date
const generateSeasonalRandomDate = (startDate, endDate, eventType) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    const monthBias = {
        WEDDING: [5, 6, 7], // June, July, August (Summer)
        CHRISTMAS: [11], // December
        BIRTHDAY: Array.from({ length: 12 }, (_, i) => i), // All months
        EXHIBITION: [2, 3, 9, 10], // March, April, October, November
        ANNIVERSARY: Array.from({ length: 12 }, (_, i) => i), // All months
        SEMINAR: [0, 1, 9, 10], // January, February, October, November
    };

    const allowedMonths = monthBias[eventType] || [];
    let randomDate;

    do {
        randomDate = new Date(start + Math.random() * (end - start));
    } while (allowedMonths.length > 0 && !allowedMonths.includes(randomDate.getMonth()));

    return randomDate.toISOString().split("T")[0];
};

// Function to generate unique integer ID
let currentId = 10000000; // Starting value for `id` (adjust as needed)
const generateUniqueId = () => currentId++;

// Function to generate event data with seasonality
const generateEventData = (years = 3, eventsPerYear = 100) => {
    const startDate = new Date();
    const endDate = new Date(startDate.getFullYear() + years, startDate.getMonth(), startDate.getDate());
    const eventData = [];

    for (let i = 0; i < eventsPerYear * years; i++) {
        const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const randomDate = generateSeasonalRandomDate(startDate, endDate, randomEvent);
        eventData.push({
            id: generateUniqueId(),
            event_date: randomDate,
            event_status: "COMPLETED",
            event_type: randomEvent,
        });
    }

    return eventData;
};

// Route to generate and insert events
router.get('/generate-events', async (req, res) => {
    try {
        const events = generateEventData();

        const { data, error } = await supabase
            .from("EVENT_RESERVATION")
            .insert(events);

        if (error) {
            console.error("Error inserting events:", error.message);
            res.status(500).json({ error: error.message });
        } else {
            console.log(`Successfully inserted ${data.length} events.`);
            res.status(200).json({ message: `Successfully inserted ${data.length} events.` });
        }
    } catch (error) {
        console.error("Error generating events:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
