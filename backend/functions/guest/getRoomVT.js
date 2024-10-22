const { supabase } = require('../../supabaseClient');

const getRoomVT = async (req, res) => {
    const { roomId } = req.query;

    try {
        const { data, error } = await supabase
            .from('VIRTUAL_TOUR')
            .select('vt_id, vt_name, vt_description, vt_photo_url, vt_status')
            .eq('room_id', roomId);

        if (error || !data) {
            return res.status(404).json({ error: 'No virtual tours found for this room.' });
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching virtual tours:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { getRoomVT };
