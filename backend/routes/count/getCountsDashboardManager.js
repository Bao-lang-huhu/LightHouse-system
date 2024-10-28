const express = require('express');
const router = express.Router();
const { supabase } = require('../../supabaseClient'); // Assuming you have a supabaseClient.js file

// Function to count records in a table excluding "DELETE" status
const getCountsDashboardManager = async (table, statusColumn = 'status') => {
    const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .neq(statusColumn, 'DELETE');
    return error ? null : count;
};

// Route to get counts for all tables
router.get('/counts', async (req, res) => {
    try {
        const counts = await Promise.all([
            getCountsDashboardManager('STAFF', 'staff_status'), // Assuming no status column in staff, if there is, provide it as second parameter
            getCountsDashboardManager('ROOM', 'room_status'), // Assuming no status column in room, if there is, provide it as second parameter
            getCountsDashboardManager('FOOD_ITEM' , 'food_status'), // Assuming the status column name is "status"
            getCountsDashboardManager('BAR_DRINK', 'drink_status'), // Assuming the status column name is "status"
            getCountsDashboardManager('CONCIERGE_DETAIL', 'concierge_status'), // Provide correct status column name if different
            getCountsDashboardManager('LAUNDRY_DETAIL', 'laundry_status'), // Provide correct status column name if different
            getCountsDashboardManager('EVENT_FOOD_PACKAGE', 'event_fd_status'), // Provide correct status column name if different
            getCountsDashboardManager('EVENT_VENUE', 'venue_status') // Provide correct status column name if different
        ]);

        res.json({
            staffCount: counts[0],
            roomCount: counts[1],
            foodItemCount: counts[2],
            barDrinkCount: counts[3],
            conciergeDetailCount: counts[4],
            laundryDetailCount: counts[5],
            eventFoodPackageCount: counts[6],
            eventCount: counts[7]
        });
    } catch (error) {
        res.status(500).json({ error: "Error fetching counts" });
    }
});

module.exports = router;
