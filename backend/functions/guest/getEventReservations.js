const { supabase } = require('../../supabaseClient'); // Import Supabase client

// API to check if an event reservation exists for a given date
const getEventReservations = async (req, res) => {
    const { event_date } = req.query; // Get event_date from query parameters (for GET requests)

    // Check if event_date is provided
    if (!event_date) {
        console.log('Event date not provided');
        return res.status(400).json({ message: 'Event date is required.' });
    }

    try {
        console.log(`Fetching reservations for event_date: ${event_date}`);
        
        // Fetch reservations for the given date but exclude "CANCELED" reservations
        const { data: reservations, error: reservationsError } = await supabase
            .from('EVENT_RESERVATION')
            .select('event_reservation_id, event_date, event_status')
            .eq('event_date', event_date)
            .neq('event_status', 'CANCELED'); // Exclude CANCELED reservations

        if (reservationsError) {
            console.error('Error fetching event reservations:', reservationsError);
            return res.status(500).json({ error: 'Failed to fetch event reservations' });
        }

        // Log the fetched reservations
        console.log('Fetched reservations:', reservations);

        // If no non-canceled reservations found, return no conflict (available)
        if (!reservations.length) {
            console.log('No conflicting event reservations found for this event_date.');
            return res.status(200).json({ conflict: false });
        }

        // If there are reservations, return a conflict
        return res.status(200).json({ conflict: true });
    } catch (error) {
        console.error('Error fetching event reservations:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { getEventReservations };
