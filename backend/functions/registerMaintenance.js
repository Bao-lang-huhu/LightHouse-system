const { supabase } = require('../supabaseClient');
const { v4: uuidv4 } = require('uuid');

const registerMaintenance = async (req, res) => {
    const { maintenanceType, maintenanceName, maintenanceNotes, roomNumber, startTime = new Date().toISOString() } = req.body;
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

        // Insert maintenance data into the MAINTENANCE table
        const { data: maintenanceData, error: maintenanceError } = await supabase
            .from('MAINTENANCE')
            .insert([
                {
                    maintenance_id: uuidv4(),
                    room_id: roomId,
                    staff_id: staffId,
                    maintenance_type: maintenanceType,
                    maintenance_name: maintenanceName,
                    maintenance_status: 'ONGOING', // Directly set to "ONGOING"
                    maintenance_date_time_start: startTime,
                    maintenance_date_time_end: null,
                    maintenance_notes: maintenanceNotes
                }
            ]);

        if (maintenanceError) {
            console.error('Error inserting maintenance record:', maintenanceError.message);
            return res.status(400).json({ error: maintenanceError.message });
        }

        console.log(`Maintenance record added successfully for staff_id: ${staffId}`);
        res.status(201).json({ message: "Maintenance record added successfully", maintenanceData });
    } catch (err) {
        console.error('Maintenance registration error:', err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { registerMaintenance };