const { supabase } = require('../../supabaseClient'); // Import Supabase client

const getLaundryGuest = async (req, res) => {
  try {
    // Fetch ongoing laundry services with related check-in data
    const { data: laundryData, error: laundryError } = await supabase
      .from('LAUNDRY')
      .select(`
          av_laundry_id,
          check_in_id,
          laun_status,
          laun_notes,
          laun_kilo,
          laun_total_price,
          laun_ironing,
          laun_is_outsourced
      `)
      .eq('laun_status', 'ONGOING');

    if (laundryError) {
      console.error('Error fetching laundry data:', laundryError);
      return res.status(500).json({ error: laundryError.message });
    }

    // Fetch related check-in data with guest details
    const { data: checkInData, error: checkInError } = await supabase
      .from('CHECK_IN')
      .select(`
          check_in_id,
          room_reservation_id,
          ROOM_RESERVATION (
              guest_id,
              GUEST (
                  guest_id,
                  guest_fname,
                  guest_lname
              )
          )
      `);

    if (checkInError) {
      console.error('Error fetching check-in data:', checkInError);
      return res.status(500).json({ error: checkInError.message });
    }

    // Fetch room list data to get room numbers
    const { data: roomListData, error: roomListError } = await supabase
      .from('ROOM_LIST')
      .select(`
          room_reservation_id,
          ROOM (
              room_id,
              room_number
          )
      `);

    if (roomListError) {
      console.error('Error fetching room list data:', roomListError);
      return res.status(500).json({ error: roomListError.message });
    }

    // Combine all data based on relationships
    const combinedData = laundryData.map(laundryItem => {
      // Match with CHECK_IN based on check_in_id
      const checkInMatch = checkInData.find(checkIn => checkIn.check_in_id === laundryItem.check_in_id);

      if (!checkInMatch) return null;

      // Get guest details from ROOM_RESERVATION
      const guestDetails = checkInMatch.ROOM_RESERVATION?.GUEST;

      // Match with ROOM_LIST based on room_reservation_id
      const roomListMatch = roomListData.find(roomList => roomList.room_reservation_id === checkInMatch.room_reservation_id);

      return {
        av_laundry_id: laundryItem.av_laundry_id,
        check_in_id: laundryItem.check_in_id,
        room_number: roomListMatch ? roomListMatch.ROOM.room_number : 'N/A',
        guest_fname: guestDetails ? guestDetails.guest_fname : 'N/A',
        guest_lname: guestDetails ? guestDetails.guest_lname : 'N/A',
        laun_notes: laundryItem.laun_notes,
        laun_kilo: laundryItem.laun_kilo,
        laun_total_price: laundryItem.laun_total_price,
        laun_ironing: laundryItem.laun_ironing,
        laun_is_outsourced: laundryItem.laun_is_outsourced
      };
    }).filter(item => item !== null); // Filter out any null values

    res.status(200).json(combinedData);
  } catch (err) {
    console.error('Error retrieving ongoing laundry services:', err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getLaundryGuest };
