const { supabase } = require('../../supabaseClient');

const getAllRooms = async (req, res) => {
  try {
    // Fetch all rooms
    const { data: roomsData, error: roomsError } = await supabase
      .from('ROOM')
      .select('room_id, room_number, room_status')
      .in('room_status', ['AVAILABLE']);

    if (roomsError) {
      console.error('Error fetching rooms:', roomsError);
      return res.status(500).json({ error: roomsError.message });
    }
    console.log("Fetched Rooms Data:", roomsData);

    const { data: laundryData, error: laundryError } = await supabase
      .from('LAUNDRY')
      .select(`
        laun_status,
        check_in_id,
        CHECK_IN (
          room_reservation_id
        )
      `)
      .eq('laun_status', 'ONGOING');

    if (laundryError) {
      console.error('Error fetching laundry data:', laundryError);
      return res.status(500).json({ error: laundryError.message });
    }
    console.log("Fetched Laundry Data:", laundryData);

    // Fetch related data for CONCIERGE with check-in details
    const { data: conciergeData, error: conciergeError } = await supabase
      .from('CONCIERGE')
      .select(`
        av_concierge_status,
        check_in_id,
        CHECK_IN (
          room_reservation_id
        )
      `)
      .eq('av_concierge_status', 'ONGOING');

    if (conciergeError) {
      console.error('Error fetching concierge data:', conciergeError);
      return res.status(500).json({ error: conciergeError.message });
    }
    console.log("Fetched Concierge Data:", conciergeData);

    // Fetch room reservation data to map room_reservation_id to room_id
    const { data: roomListData, error: roomListError } = await supabase
      .from('ROOM_LIST')
      .select('room_reservation_id, room_id');

    if (roomListError) {
      console.error('Error fetching room list data:', roomListError);
      return res.status(500).json({ error: roomListError.message });
    }
    console.log("Fetched Room List Data:", roomListData);

    // Map room reservations to room IDs
    const roomReservationMap = roomListData.reduce((acc, { room_reservation_id, room_id }) => {
      if (!acc[room_id]) acc[room_id] = [];
      acc[room_id].push(room_reservation_id);
      return acc;
    }, {});
    console.log("Room Reservation Map:", roomReservationMap);

    // Combine room data with laundry and concierge statuses based on room_id
    const combinedData = roomsData.map((room) => {
      const reservationIds = roomReservationMap[room.room_id] || [];

      const roomLaundryStatus = reservationIds.some(
        (reservationId) => laundryData.some(
          (laundry) => laundry.CHECK_IN?.room_reservation_id === reservationId
        )
      ) ? 'ONGOING' : null;

      const roomConciergeStatus = reservationIds.some(
        (reservationId) => conciergeData.some(
          (concierge) => concierge.CHECK_IN?.room_reservation_id === reservationId
        )
      ) ? 'ONGOING' : null;

      console.log(`Room ${room.room_number}: Laundry Status - ${roomLaundryStatus || 'None'}, Concierge Status - ${roomConciergeStatus || 'None'}`);

      return {
        room_id: room.room_id,
        room_number: room.room_number,
        laundry_status: roomLaundryStatus,
        concierge_status: roomConciergeStatus,
      };
    });

    console.log("Combined Data:", combinedData);
    res.status(200).json(combinedData);
  } catch (error) {
    console.error('Error fetching all rooms:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getAllRooms };
