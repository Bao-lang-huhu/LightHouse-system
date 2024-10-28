const { supabase } = require('../supabaseClient');
const { v4: uuidv4 } = require('uuid');

const registerHousekeeping = async (req, res) => {
    const { housekeepingType, housekeepingNotes, roomNumber, housekeepingStatus = 'DIRTY', housekeepingStart = new Date().toISOString() } = req.body;
    const staffId = req.staffId; // Get staffId from verified token

    if (!staffId) return res.status(403).json({ error: 'User not authenticated' });

    try {
        // Retrieve the room_id from the ROOM table using roomNumber
        const { data: roomData, error: roomError } = await supabase
            .from('ROOM')
            .select('room_id')
            .eq('room_number', roomNumber)
            .single();

        if (roomError || !roomData) {
            return res.status(400).json({ error: 'Room not found' });
        }

        const roomId = roomData.room_id;

        // Insert housekeeping data into the HOUSEKEEPING table
        const { data: housekeepingData, error: housekeepingError } = await supabase
            .from('HOUSEKEEPING')
            .insert([
                {
                    housekeeping_id: uuidv4(),
                    room_id: roomId,
                    staff_id: staffId,
                    housekeeping_type: housekeepingType,
                    housekeeping_status: housekeepingStatus,
                    housekeeping_start: housekeepingStart,
                    housekeeping_end: null,
                    housekeeping_notes: housekeepingNotes
                }
            ]);

        if (housekeepingError) {
            console.error('Error inserting housekeeping record:', housekeepingError.message);
            return res.status(400).json({ error: housekeepingError.message });
        }

        console.log(`Housekeeping record added successfully for staff_id: ${staffId}`);
        res.status(201).json({ message: "Housekeeping record added successfully", housekeepingData });
    } catch (err) {
        console.error('Housekeeping registration error:', err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { registerHousekeeping };
