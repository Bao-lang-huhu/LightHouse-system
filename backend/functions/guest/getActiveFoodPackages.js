const { supabase } = require('../../supabaseClient');

// API to get active food packages
const getActiveFoodPackages = async (req, res) => {
    try {
        // Fetch food packages with active status
        const { data: foodPackages, error } = await supabase
            .from('EVENT_FOOD_PACKAGE')
            .select('event_fd_pckg_id, event_fd_pckg_name, event_fd_pckg_final_price, event_fd_main_dish_lmt, event_fd_pasta_lmt, event_fd_rice_lmt, event_fd_dessert_lmt, event_fd_drinks_lmt')
            .eq('event_fd_status', 'ACTIVE'); 

        if (error) {
            console.error('Error fetching active food packages:', error);
            return res.status(500).json({ error: 'Failed to fetch active food packages' });
        }

        if (!foodPackages.length) {
            return res.status(404).json({ message: 'No active food packages found.' });
        }

        return res.status(200).json(foodPackages);
    } catch (error) {
        console.error('Error fetching active food packages:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { getActiveFoodPackages };
