const { supabase } = require('../../supabaseClient'); // Import Supabase client

const registerRoomVT = async (req, res) => {
    const { room_id, vt_name, vt_description, vt_photo_url, vt_status } = req.body;

    // Check for required fields
    if (!room_id || !vt_name || !vt_photo_url) {
        return res.status(400).json({ message: 'Room ID, Virtual Tour Name, and Photo are required.' });
    }

    // Set the max size limit to 3 MB (3 * 1024 * 1024 bytes)
    const MAX_SIZE = 3 * 1024 * 1024;

    // Estimate the size of the Base64 photo by converting characters to bytes (each Base64 character is approximately 0.75 bytes)
    if (vt_photo_url.length * 0.75 > MAX_SIZE) {
        return res.status(400).json({ message: 'Photo size exceeds 3 MB. Please upload a smaller image.' });
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
