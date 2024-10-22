const { supabase } = require('../../supabaseClient');

const getVirtualTours = async (req, res) => {
    const { room_id } = req.query; 

    try {
        let query = supabase
            .from('VIRTUAL_TOUR')
            .select('*')
            .eq('vt_status', 'ACTIVE'); 

        if (room_id) {
            query = query.eq('room_id', room_id);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching virtual tours:', error);
            return res.status(500).json({ message: 'Failed to fetch virtual tours' });
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};


module.exports = { getVirtualTours };
