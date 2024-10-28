// getRoomsAll.js
const { supabase } = require('../../supabaseClient');

const getRoomsAll = async (req, res) => {
    try {
        const { data: rooms, error } = await supabase
            .from('ROOM')
            .select('room_id, room_number, room_type_name');

        if (error) {
            console.error('Error retrieving rooms:', error.message);
            return res.status(400).json({ error: error.message });
        }
        
        const formattedRooms = rooms.map(room => ({
            id: room.room_id,
            title: `Room ${room.room_number} - ${room.room_type_name}`,
        }));
        
        res.status(200).json(formattedRooms);
    } catch (err) {
        console.error('Error fetching rooms:', err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { getRoomsAll };
