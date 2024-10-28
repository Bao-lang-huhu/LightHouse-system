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

module.exports = router;