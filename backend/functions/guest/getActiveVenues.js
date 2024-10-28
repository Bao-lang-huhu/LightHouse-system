const { supabase } = require('../../supabaseClient');

const getActiveVenues = async (req, res) => {
    try {
        const { data: venues, error } = await supabase
            .from('EVENT_VENUE')
            .select('event_venue_id, venue_name, venue_description, venue_max_pax, venue_price, venue_final_price')
            .eq('venue_status', 'ACTIVE'); 

        if (error) {
            console.error('Error fetching active venues:', error);
            return res.status(500).json({ error: 'Failed to fetch active venues' });
        }

        if (!venues.length) {
            return res.status(404).json({ message: 'No active venues found.' });
        }

        return res.status(200).json(venues);
    } catch (error) {
        console.error('Error fetching active venues:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { getActiveVenues };
