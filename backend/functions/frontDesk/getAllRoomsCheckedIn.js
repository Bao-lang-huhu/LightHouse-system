const { supabase } = require('../../supabaseClient');

const getAllRoomsCheckedIn = async (req, res) => {
  try {
    // Fetch all rooms with status AVAILABLE
    const { data: roomsData, error: roomsError } = await supabase
      .from('ROOM')
      .select('room_id, room_number, room_status')
      .in('room_status', ['AVAILABLE']);

    if (roomsError) {
      console.error('Error fetching rooms:', roomsError);
      return res.status(500).json({ error: roomsError.message });
    }
    console.log("Fetched Rooms Data:", roomsData);

    // Fetch check-in data where check-in status is CHECKED_IN
    const { data: checkInData, error: checkInError } = await supabase
      .from('CHECK_IN')
      .select('room_reservation_id, check_in_status')
      .eq('check_in_status', 'CHECKED_IN');

    if (checkInError) {
      console.error('Error fetching check-in data:', checkInError);
      return res.status(500).json({ error: checkInError.message });
    }
    console.log("Fetched Check-In Data:", checkInData);

    // Fetch room reservation data to map room_reservation_id to room_id
    const { data: roomListData, error: roomListError } = await supabase
      .from('ROOM_LIST')
      .select('room_reservation_id, room_id');

    if (roomListError) {
      console.error('Error fetching room list data:', roomListError);
      return res.status(500).json({ error: roomListError.message });
    }
    console.log("Fetched Room List Data:", roomListData);

    // Map room reservations to room IDs for checked-in rooms
    const checkedInMap = roomListData.reduce((acc, { room_reservation_id, room_id }) => {
      const isCheckedIn = checkInData.some((checkIn) => checkIn.room_reservation_id === room_reservation_id);
      if (isCheckedIn) {
        acc[room_id] = true;
      }
      return acc;
    }, {});

    // Combine room data with check-in status
    const combinedData = roomsData.map((room) => {
      const isCheckedIn = checkedInMap[room.room_id] || false;

      console.log(`Room ${room.room_number}: Checked-In Status - ${isCheckedIn ? 'CHECKED_IN' : 'Not Checked-In'}`);

      return {
        room_id: room.room_id,
        room_number: room.room_number,
        room_status: room.room_status,
        check_in_status: isCheckedIn ? 'CHECKED_IN' : 'Not Checked-In',
      };
    });

    console.log("Combined Data:", combinedData);
    res.status(200).json(combinedData);
  } catch (error) {
    console.error('Error fetching all rooms:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getAllRoomsCheckedIn };
