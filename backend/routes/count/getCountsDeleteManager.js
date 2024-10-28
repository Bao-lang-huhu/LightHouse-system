const express = require('express');
const router = express.Router();
const { supabase } = require('../../supabaseClient'); // Assuming you have a supabaseClient.js file

// Function to count records in a table with "DELETE" status
const getDeletedCountsDashboardManager = async (table, statusColumn = 'status') => {
    const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq(statusColumn, 'DELETE');
    return error ? null : count;
};

// Route to get counts for all tables with "DELETE" status
router.get('/deleted_counts', async (req, res) => {
    try {
        const counts = await Promise.all([
            getDeletedCountsDashboardManager('STAFF', 'staff_status'), 
            getDeletedCountsDashboardManager('ROOM', 'room_status'), 
            getDeletedCountsDashboardManager('FOOD_ITEM', 'food_status'), 
            getDeletedCountsDashboardManager('BAR_DRINK', 'drink_status'), 
            getDeletedCountsDashboardManager('CONCIERGE_DETAIL', 'concierge_status'), 
            getDeletedCountsDashboardManager('LAUNDRY_DETAIL', 'laundry_status'), 
            getDeletedCountsDashboardManager('EVENT_FOOD_PACKAGE', 'event_fd_status'), 
            getDeletedCountsDashboardManager('EVENT_VENUE', 'venue_status')
        ]);

        res.json({
            deletedStaffCount: counts[0],
            deletedRoomCount: counts[1],
            deletedFoodItemCount: counts[2],
            deletedBarDrinkCount: counts[3],
            deletedConciergeDetailCount: counts[4],
            deletedLaundryDetailCount: counts[5],
            deletedEventFoodPackageCount: counts[6],
            deletedEventCount: counts[7]
        });
    } catch (error) {
        res.status(500).json({ error: "Error fetching deleted counts" });
    }
});

module.exports = router;
