const express = require('express');
const router = express.Router();
const { supabase } = require('../supabaseClient');
const { v4: uuidv4 } = require('uuid'); // UUID generator for unique IDs

// Handler to register housekeeping
const registerHousekeeping = async (req, res) => {
  const { housekeepingType, housekeepingNotes, roomNumber, staffId } = req.body;
  
  console.log("Received data:", req.body); // Log incoming request data
  
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

    // Insert housekeeping record into HOUSEKEEPING table
    const { data: housekeepingData, error: housekeepingError } = await supabase
      .from('HOUSEKEEPING')
      .insert([
        {
          housekeeping_id: uuidv4(),
          housekeeping_type: housekeepingType,
          housekeeping_notes: housekeepingNotes,
          room_id: roomId,
          staff_id: staffId,
          housekeeping_status: 'DIRTY',
          housekeeping_start: new Date().toISOString()
        }
      ]);

    if (housekeepingError) {
      console.error("Error inserting housekeeping record:", housekeepingError);
      return res.status(400).json({ error: housekeepingError.message });
    }

    res.status(201).json({ message: "Housekeeping record added successfully", housekeepingData });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Handler to get housekeeping records
const getHousekeepingRecords = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('HOUSEKEEPING')
      .select(`
        housekeeping_id,
        room_id,
        staff_id,
        housekeeping_type,
        housekeeping_start,
        housekeeping_end,
        housekeeping_notes,
        housekeeping_status
      `);

    if (error) {
      console.error("Error fetching records:", error);
      return res.status(500).json({ error: 'Error fetching housekeeping records' });
    }

    res.json(data);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Route definitions
router.post('/add-housekeeping', registerHousekeeping);
router.get('/housekeeping-records', getHousekeepingRecords);

router.get('/rooms', async (req, res) => {
    try {
      // Fetch all housekeeping records with status DIRTY
      const { data: housekeepingData, error: housekeepingError } = await supabase
        .from('HOUSEKEEPING')
        .select('room_id')
        .eq('housekeeping_status', 'DIRTY');
  
      if (housekeepingError) {
        console.error('Error fetching dirty housekeeping data:', housekeepingError);
        return res.status(500).json({ error: housekeepingError.message });
      }
  
      // Extract room_ids from dirty housekeeping records
      const dirtyRoomIds = housekeepingData.map((record) => record.room_id);
  
      // Fetch all rooms
      const { data: roomData, error: roomError } = await supabase
        .from('ROOM')
        .select('room_id, room_number');
  
      if (roomError) {
        console.error('Error fetching room data:', roomError);
        return res.status(500).json({ error: roomError.message });
      }
  
      // Filter out dirty rooms manually
      const cleanRooms = roomData.filter(room => !dirtyRoomIds.includes(room.room_id));
  
      res.json(cleanRooms); // Respond with only clean rooms
    } catch (err) {
      console.error('Server error:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

  router.get('/dirty-rooms', async (req, res) => {
    try {
        // Fetch all housekeeping records with status DIRTY
        const { data: housekeepingData, error: housekeepingError } = await supabase
            .from('HOUSEKEEPING')
            .select('housekeeping_id, room_id, housekeeping_status')
            .eq('housekeeping_status', 'DIRTY');

        if (housekeepingError) {
            console.error('Error fetching dirty housekeeping data:', housekeepingError);
            return res.status(500).json({ error: housekeepingError.message });
        }

        // Fetch room numbers for the dirty rooms
        const dirtyRoomIds = housekeepingData.map((record) => record.room_id);
        const { data: roomData, error: roomError } = await supabase
            .from('ROOM')
            .select('room_id, room_number')
            .in('room_id', dirtyRoomIds);

        if (roomError) {
            console.error('Error fetching room data:', roomError);
            return res.status(500).json({ error: roomError.message });
        }

        // Merge housekeeping data with room data
        const mergedData = housekeepingData.map(housekeepingRecord => {
            const room = roomData.find(r => r.room_id === housekeepingRecord.room_id);
            return {
                housekeeping_id: housekeepingRecord.housekeeping_id,
                room_id: housekeepingRecord.room_id,
                housekeeping_status: housekeepingRecord.housekeeping_status,
                room_number: room ? room.room_number : 'Unknown'
            };
        });

        res.json(mergedData);
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

  
  // Update housekeeping status to CLEANED
router.put('/housekeeping/:room_id/cleaned', async (req, res) => {
    const { room_id } = req.params;
    const { housekeeping_end } = req.body;

    try {
        const { data, error } = await supabase
            .from('HOUSEKEEPING')
            .update({ housekeeping_status: 'CLEANED', housekeeping_end })
            .eq('room_id', room_id);

        if (error) {
            console.error('Error updating housekeeping status:', error);
            return res.status(500).json({ error: error.message });
        }

        res.json({ message: 'Room cleaned successfully' });
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/housekeeping/:housekeeping_id', async (req, res) => {
    const { housekeeping_id } = req.params;
    try {
        const { data, error } = await supabase
            .from('HOUSEKEEPING')
            .select('housekeeping_id, room_id, housekeeping_status, staff_id, housekeeping_notes, housekeeping_start, housekeeping_end')
            .eq('housekeeping_id', housekeeping_id)
            .single();

        if (error) {
            console.error('Error fetching housekeeping details:', error.message);
            return res.status(500).json({ error: error.message });
        }

        // Fetch room and staff details
        const { data: roomData, error: roomError } = await supabase
            .from('ROOM')
            .select('room_number')
            .eq('room_id', data.room_id)
            .single();

        const { data: staffData, error: staffError } = await supabase
            .from('STAFF')
            .select('staff_fname')
            .eq('staff_id', data.staff_id)
            .single();

        if (roomError || staffError) {
            console.error('Error fetching room/staff details:', roomError || staffError);
            return res.status(500).json({ error: (roomError || staffError).message });
        }

        // Combine housekeeping, room, and staff details
        const response = {
            ...data,
            room_number: roomData ? roomData.room_number : 'Unknown',
            staff_name: staffData ? staffData.staff_fname : 'Unknown',
        };

        res.json(response);
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/housekeeping/:housekeeping_id/update', async (req, res) => {
    const { housekeeping_id } = req.params;
    const { housekeeping_status, housekeeping_end } = req.body;

    try {
        const { data, error } = await supabase
            .from('HOUSEKEEPING')
            .update({
                housekeeping_status,
                housekeeping_end: housekeeping_status === 'CLEANED' ? housekeeping_end : null,
            })
            .eq('housekeeping_id', housekeeping_id);

        if (error) {
            console.error('Error updating housekeeping status:', error.message);
            return res.status(500).json({ error: error.message });
        }

        res.json({ message: 'Housekeeping status updated successfully', data });
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/housekeeping-records', async (req, res) => {
    try {
        // Fetch housekeeping records along with room_number by joining ROOM table
        const { data: housekeepingData, error } = await supabase
            .from('HOUSEKEEPING')
            .select(`
                housekeeping_id,
                room_id,
                housekeeping_start,
                housekeeping_end,
                housekeeping_status,
                housekeeping_notes,
                ROOM (room_number)
            `);

        if (error) {
            console.error('Error fetching housekeeping records:', error);
            return res.status(500).json({ error: error.message });
        }

        // Flatten the data structure to make room_number directly accessible
        const recordsWithRoomNumbers = housekeepingData.map(record => ({
            housekeeping_id: record.housekeeping_id,
            room_id: record.room_id,
            housekeeping_start: record.housekeeping_start,
            housekeeping_end: record.housekeeping_end,
            housekeeping_status: record.housekeeping_status,
            housekeeping_notes: record.housekeeping_notes,
            room_number: record.ROOM ? record.ROOM.room_number : 'N/A'
        }));

        res.json(recordsWithRoomNumbers);
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/room-numbers', async (req, res) => {
    try {
        // Retrieve room_ids from query parameters
        let roomIds = req.query.room_ids;

        // Ensure roomIds is an array
        if (!Array.isArray(roomIds)) {
            roomIds = [roomIds];
        }

        // Fetch rooms with the specified room_ids
        const { data: roomData, error } = await supabase
            .from('ROOM')
            .select('room_id, room_number')
            .in('room_id', roomIds);

        if (error) {
            console.error('Error fetching room data:', error);
            return res.status(500).json({ error: error.message });
        }

        // Log fetched room data for debugging
        console.log("Fetched Room Data:", roomData);

        res.json(roomData);
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;