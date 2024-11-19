const express = require('express');
const router = express.Router();
const axios = require('axios');
const { supabase } = require('../supabaseClient');
require('dotenv').config();

const flaskApiUrl = 'https://generous-optimism-production.up.railway.app';

router.post('/manager_forecast', async (req, res) => {
    try {
        // Fetch occupancy rates
        const { data: checkInData, error: checkInError } = await supabase
            .from('CHECK_IN')
            .select('room_reservation_id, payment_status')
            .eq('payment_status', 'PAID');

        if (checkInError) throw new Error(`Supabase error: ${checkInError.message}`);

        const completedReservationIds = checkInData.map(entry => entry.room_reservation_id);

        const { data: reservationsData, error: reservationError } = await supabase
            .from('ROOM_RESERVATION')
            .select('room_check_in_date, room_check_out_date, room_reservation_id')
            .in('room_reservation_id', completedReservationIds);

        if (reservationError) throw new Error(`Supabase error: ${reservationError.message}`);

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
            if (!monthlyOccupancy[monthYear]) monthlyOccupancy[monthYear] = 0;
            monthlyOccupancy[monthYear] += dailyOccupancy[dateStr];
        });

        const occupancyRates = Object.entries(monthlyOccupancy).map(([month, roomsOccupied]) => {
            const [year, monthIndex] = month.split('-').map(Number);
            const daysInMonth = new Date(year, monthIndex, 0).getDate();
            const occupancyRate = (roomsOccupied / (20 * daysInMonth)) * 100;
            return { ds: `${year}-${monthIndex.toString().padStart(2, '0')}-01`, y: occupancyRate };
        });

        const response = await axios.post(flaskApiUrl, occupancyRates, {
            headers: { 'Content-Type': 'application/json' }
        });

        const historicalData = occupancyRates.map(item => ({ ...item, isHistorical: true }));

        // Include forecasted data beyond the historical range
        const forecastedData = response.data.filter(item =>
            !historicalData.some(hist => hist.ds === item.ds) || item.isHistorical === false
        );

        res.json([...historicalData, ...forecastedData]);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch forecast.' });
    }
});

module.exports = router;
