const express = require('express');
const router = express.Router();
const { supabase } = require('../supabaseClient');
const { v4: uuidv4 } = require('uuid');

// Handler to register maintenance
const registerMaintenance = async (req, res) => {
    const { maintenanceType, maintenanceName, maintenanceNotes, roomNumber, staffId } = req.body;

    console.log("Received maintenance data:", req.body); // Log incoming request data

    try {
        // Fetch room_id based on roomNumber from ROOM table
        const { data: roomData, error: roomError } = await supabase
            .from('ROOM')
            .select('room_id')
            .eq('room_number', roomNumber)
            .single();

        if (roomError || !roomData) {
            console.error("Room not found:", roomError);
            return res.status(400).json({ error: 'Room not found' });
        }

        const roomId = roomData.room_id;

        // Insert maintenance record into MAINTENANCE table
        const { data: maintenanceData, error: maintenanceError } = await supabase
            .from('MAINTENANCE')
            .insert([
                {
                    maintenance_id: uuidv4(),
                    maintenance_type: maintenanceType,
                    maintenance_name: maintenanceName,
                    maintenance_notes: maintenanceNotes,
                    room_id: roomId,
                    staff_id: staffId,
                    maintenance_status: 'ONGOING', // Directly set to "ONGOING"
                    maintenance_date_time_start: new Date().toISOString(),
                    maintenance_date_time_end: null
                }
            ]);

        if (maintenanceError) {
            console.error("Error inserting maintenance record:", maintenanceError);
            return res.status(400).json({ error: maintenanceError.message });
        }

        res.status(201).json({ message: "Maintenance record added successfully", maintenanceData });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Handler to get maintenance records with room_number
const getMaintenanceRecords = async (req, res) => {
    try {
        // Fetch maintenance records along with room_number by joining ROOM table
        const { data: maintenanceData, error } = await supabase
            .from('MAINTENANCE')
            .select(`
                maintenance_id,
                room_id,
                maintenance_type,
                maintenance_name,
                maintenance_date_time_start,
                maintenance_date_time_end,
                maintenance_status,
                maintenance_notes,
                ROOM (room_number)
            `);

        if (error) {
            console.error('Error fetching maintenance records:', error);
            return res.status(500).json({ error: error.message });
        }

        // Flatten the data structure to make room_number directly accessible
        const recordsWithRoomNumbers = maintenanceData.map(record => ({
            maintenance_id: record.maintenance_id,
            room_id: record.room_id,
            maintenance_type: record.maintenance_type,
            maintenance_name: record.maintenance_name,
            maintenance_date_time_start: record.maintenance_date_time_start,
            maintenance_date_time_end: record.maintenance_date_time_end,
            maintenance_status: record.maintenance_status,
            maintenance_notes: record.maintenance_notes,
            room_number: record.ROOM ? record.ROOM.room_number : 'N/A'
        }));

        res.json(recordsWithRoomNumbers);
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Handler to update maintenance status to COMPLETED
const updateMaintenanceStatus = async (req, res) => {
    const { maintenance_id } = req.params;
    const { maintenance_date_time_end = new Date().toISOString() } = req.body;

    try {
        const { data, error } = await supabase
            .from('MAINTENANCE')
            .update({ maintenance_status: 'COMPLETE', maintenance_date_time_end })
            .eq('maintenance_id', maintenance_id);

        if (error) {
            console.error('Error updating maintenance status:', error);
            return res.status(500).json({ error: error.message });
        }

        res.json({ message: 'Maintenance status updated successfully', data });
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Fetch rooms with 'ONGOING' maintenance status
router.get('/maintenance-rooms', async (req, res) => {
    try {
        // Fetch maintenance records with 'ONGOING' status
        const { data: maintenanceData, error } = await supabase
            .from('MAINTENANCE')
            .select('maintenance_id, room_id, maintenance_status')
            .eq('maintenance_status', 'ONGOING');

        if (error) {
            console.error('Error fetching maintenance records:', error);
            return res.status(500).json({ error: error.message });
        }

        // Get room numbers for rooms needing maintenance
        const roomIds = maintenanceData.map((record) => record.room_id);
        const { data: roomData, error: roomError } = await supabase
            .from('ROOM')
            .select('room_id, room_number')
            .in('room_id', roomIds);

        if (roomError) {
            console.error('Error fetching room data:', roomError);
            return res.status(500).json({ error: roomError.message });
        }

        // Combine maintenance data with room numbers
        const roomsNeedingMaintenance = maintenanceData.map((maintenanceRecord) => {
            const room = roomData.find(r => r.room_id === maintenanceRecord.room_id);
            return {
                maintenance_id: maintenanceRecord.maintenance_id,
                room_id: maintenanceRecord.room_id,
                maintenance_status: maintenanceRecord.maintenance_status,
                room_number: room ? room.room_number : 'Unknown'
            };
        });

        res.json(roomsNeedingMaintenance);
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Fetch maintenance details by maintenance_id
router.get('/maintenance/:maintenance_id', async (req, res) => {
    const { maintenance_id } = req.params;
    try {
        // Fetch maintenance record by maintenance_id
        const { data: maintenanceData, error: maintenanceError } = await supabase
            .from('MAINTENANCE')
            .select('maintenance_id, room_id, maintenance_type, maintenance_name, maintenance_notes, staff_id, maintenance_date_time_start, maintenance_date_time_end, maintenance_status')
            .eq('maintenance_id', maintenance_id)
            .single();

        if (maintenanceError) {
            console.error('Error fetching maintenance details:', maintenanceError.message);
            return res.status(500).json({ error: maintenanceError.message });
        }

        // Fetch room details using room_id from the maintenance record
        const { data: roomData, error: roomError } = await supabase
            .from('ROOM')
            .select('room_number')
            .eq('room_id', maintenanceData.room_id)
            .single();

        if (roomError) {
            console.error('Error fetching room details:', roomError.message);
            return res.status(500).json({ error: roomError.message });
        }

        // Fetch staff details using staff_id from the maintenance record
        const { data: staffData, error: staffError } = await supabase
            .from('STAFF')
            .select('staff_fname')
            .eq('staff_id', maintenanceData.staff_id)
            .single();

        if (staffError) {
            console.error('Error fetching staff details:', staffError.message);
            return res.status(500).json({ error: staffError.message });
        }

        // Combine maintenance, room, and staff details into the response
        const response = {
            ...maintenanceData,
            room_number: roomData ? roomData.room_number : 'Unknown',
            staff_name: staffData ? staffData.staff_fname : 'Unknown',
        };

        res.json(response);
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// In maintenanceRoutes.js or similar file
router.get('/maintenance-records', async (req, res) => {
    try {
        const { data: maintenanceData, error } = await supabase
            .from('MAINTENANCE')
            .select(`
                maintenance_id,
                room_id,
                maintenance_type,
                maintenance_status,
                maintenance_notes,
                maintenance_date_time_start,
                maintenance_date_time_end,
                ROOM (room_number)
            `);

        if (error) {
            console.error('Error fetching maintenance records:', error);
            return res.status(500).json({ error: error.message });
        }

        // Flatten the data structure to make room_number directly accessible
        const recordsWithRoomNumbers = maintenanceData.map(record => ({
            maintenance_id: record.maintenance_id,
            room_id: record.room_id,
            maintenance_type: record.maintenance_type,
            maintenance_status: record.maintenance_status,
            maintenance_notes: record.maintenance_notes,
            maintenance_date_time_start: record.maintenance_date_time_start,
            maintenance_date_time_end: record.maintenance_date_time_end,
            room_number: record.ROOM ? record.ROOM.room_number : 'N/A'
        }));

        res.json(recordsWithRoomNumbers);
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Handler to cancel maintenance by updating its status to "CANCELED"
const cancelMaintenance = async (req, res) => {
    const { maintenance_id } = req.params;

    try {
        // Update the maintenance status to "CANCELED" and set the current date/time for `maintenance_date_time_end`
        const { data, error } = await supabase
            .from('MAINTENANCE')
            .update({
                maintenance_status: 'CANCELED',
                maintenance_date_time_end: new Date().toISOString() // Set to current date and time
            })
            .eq('maintenance_id', maintenance_id);

        if (error) {
            console.error('Error canceling maintenance:', error);
            return res.status(500).json({ error: error.message });
        }

        res.json({ message: 'Maintenance status updated to CANCELED with end time', data });
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};




// Route definitions
router.put('/maintenance/:maintenance_id/cancel', cancelMaintenance); // New route for canceling maintenance
router.post('/add-maintenance', registerMaintenance);
router.get('/maintenance-records', getMaintenanceRecords);
router.put('/maintenance/:maintenance_id/completed', updateMaintenanceStatus);

module.exports = router;
