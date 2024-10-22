const { supabase } = require('../../supabaseClient'); // Import Supabase client 

const getRoomDetailsByRoomId = async (req, res) => {
    const { room_id } = req.params; // Use req.params instead of req.query

    if (!room_id) {
        console.log('Room ID not provided');
        return res.status(400).json({ message: 'Room ID is required.' });
    }

    try {
        console.log(`Fetching details for room_id: ${room_id}`);

        const { data: roomDetails, error: roomDetailsError } = await supabase
            .from('ROOM')
            .select('*') 
            .eq('room_id', room_id);

        if (roomDetailsError) {
            console.error('Error fetching room details:', roomDetailsError);
            return res.status(500).json({ error: 'Failed to fetch room details' });
        }

        if (!roomDetails.length) {
            console.log('No room found for this room_id.');
            return res.status(404).json({ message: 'No room found for this room_id.' });
        }

        const { data: roomPhotos, error: roomPhotosError } = await supabase
            .from('ROOM_PHOTO_LIST')
            .select('room_id, room_photo_url')
            .eq('room_id', room_id);

        if (roomPhotosError) {
            console.error('Error fetching room photos:', roomPhotosError);
            return res.status(500).json({ error: 'Failed to fetch room photos' });
        }

        console.log('Fetched room photos:', roomPhotos);

        return res.status(200).json({
            room: roomDetails[0],
            photos: roomPhotos 
        });
    } catch (error) {
        console.error('Error fetching room details:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { getRoomDetailsByRoomId };
