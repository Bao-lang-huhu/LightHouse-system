const { supabase } = require('../../supabaseClient'); // Import Supabase client

const registerRoomVT = async (req, res) => {
    const { room_id, vt_name, vt_description, vt_photo_url, vt_status } = req.body;

    if (!room_id || !vt_name || !vt_photo_url) {
        return res.status(400).json({ message: 'Room ID, Virtual Tour Name, and Photo are required.' });
    }

    try {
        const { data, error } = await supabase
            .from('VIRTUAL_TOUR')
            .insert([
                {
                    room_id: room_id,
                    vt_name: vt_name,
                    vt_description: vt_description || '',
                    vt_photo_url: vt_photo_url,
                    vt_status: vt_status || 'ACTIVE'
                }
            ]);

        if (error) {
            throw error;
        }

        res.status(200).json({ message: 'Virtual tour added successfully', data });
    } catch (err) {
        console.error('Error adding virtual tour:', err);
        res.status(500).json({ message: 'Failed to add virtual tour.', error: err.message });
    }
};

module.exports = { registerRoomVT };
