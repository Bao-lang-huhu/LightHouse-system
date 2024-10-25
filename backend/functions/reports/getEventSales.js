const { supabase } = require('../../supabaseClient'); 

const getEventSales = async (req, res) => {
    const type = req.query.type || 'monthly'; // Default to 'monthly' if not specified
    try {
        const { data: events, error: eventError } = await supabase
            .from('EVENT_RESERVATION')
            .select('event_date, event_total_price')
            .eq('event_status', 'COMPLETED');

        if (eventError) {
            console.error(`Error fetching EVENT_RESERVATION data: ${eventError.message}`);
            return res.status(500).json({ error: 'Error fetching EVENT_RESERVATION data' });
        }

        const salesData = {};
        events.forEach(event => {
            const eventDate = new Date(event.event_date);
            let key;
            if (type === 'yearly') {
                key = `${eventDate.getFullYear()}`;
            } else {
                key = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}`;
            }

            if (!salesData[key]) {
                salesData[key] = 0;
            }

            salesData[key] += event.event_total_price || 0;
        });

        // Convert the object into an array and sort it by date
        const result = Object.entries(salesData)
            .map(([key, totalSales]) => ({
                period: key,
                totalSales
            }))
            .sort((a, b) => new Date(a.period) - new Date(b.period)); // Sort by date

        res.status(200).json(result);
    } catch (error) {
        console.error('Error processing event sales data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getEventSales };
