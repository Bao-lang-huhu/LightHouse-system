const { supabase } = require('../../supabaseClient');

const getAllRoomHM = async (req, res) => {
  try {
    console.log('Fetching rooms for housekeeping and maintenance');

    // Step 1: Fetch rooms from ROOM table
    const { data: roomsData, error: roomsError } = await supabase
      .from('ROOM')
      .select('room_id, room_number, room_type_name'); // Only select relevant columns from ROOM

    if (roomsError) {
      console.error('Error fetching rooms:', roomsError);
      return res.status(500).json({ error: roomsError.message });
    }
    console.log("Fetched Rooms Data:", roomsData);

    // Step 2: Fetch housekeeping data where housekeeping_status = 'DIRTY'
    const { data: housekeepingData, error: housekeepingError } = await supabase
      .from('HOUSEKEEPING')
      .select('room_id')
      .eq('housekeeping_status', 'DIRTY');

    if (housekeepingError) {
      console.error('Error fetching housekeeping data:', housekeepingError);
      return res.status(500).json({ error: housekeepingError.message });
    }
    console.log("Fetched Housekeeping Data:", housekeepingData);

    // Step 3: Fetch maintenance data where maintenance_status = 'ONGOING'
    const { data: maintenanceData, error: maintenanceError } = await supabase
      .from('MAINTENANCE')
      .select('room_id')
      .eq('maintenance_status', 'ONGOING');

    if (maintenanceError) {
      console.error('Error fetching maintenance data:', maintenanceError);
      return res.status(500).json({ error: maintenanceError.message });
    }
    console.log("Fetched Maintenance Data:", maintenanceData);

    // Step 4: Combine housekeeping and maintenance data with room details
    const combinedData = roomsData.map((room) => {
      const isDirty = housekeepingData.some(hk => hk.room_id === room.room_id);
      const isOngoing = maintenanceData.some(mt => mt.room_id === room.room_id);

      return {
        room_id: room.room_id,
        room_number: room.room_number,
        room_type_name: room.room_type_name,
        housekeeping_status: isDirty ? 'DIRTY' : 'CLEAN', // Mark as DIRTY if found in housekeeping data
        maintenance_status: isOngoing ? 'ONGOING' : 'COMPLETED' // Mark as ONGOING if found in maintenance data
      };
    });

    console.log("Combined Data for Housekeeping and Maintenance:", combinedData);
    res.status(200).json(combinedData);
  } catch (error) {
    console.error('Error fetching housekeeping and maintenance data:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getAllRoomHM };
