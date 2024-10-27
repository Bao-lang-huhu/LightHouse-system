const { supabase } = require('../../supabaseClient');

const getCheckInData = async (req, res) => {
  try {
    const { data: checkInData, error } = await supabase
      .from('CHECK_IN')
      .select(`
        check_in_id,
        room_reservation_id,
        staff_id,
        check_in_date_time,
        check_out_date_time,
        initial_payment,
        payment_status,
        check_in_status,
        STAFF (
          staff_id,
          staff_fname,
          staff_lname
        ),
        ROOM_RESERVATION (
          room_downpayment,
          guest_id,
          GUEST (
            guest_id,
            guest_fname,
            guest_lname
          )
        )
      `);

    if (error) {
      console.error('Error fetching check-in data:', error.message);
      return res.status(500).json({ error: 'Error fetching check-in data' });
    }

    // Map the response to extract and include staff, downpayment, and guest details
    const mappedCheckInData = checkInData.map(item => ({
      ...item,
      staff_fname: item.STAFF?.staff_fname || 'Unknown',
      staff_lname: item.STAFF?.staff_lname || 'Staff',
      room_downpayment: item.ROOM_RESERVATION?.room_downpayment !== null ? item.ROOM_RESERVATION.room_downpayment : 0, // Default to 0 if null
      guest_id: item.ROOM_RESERVATION?.guest_id || 'Unknown',
      guest_fname: item.ROOM_RESERVATION?.GUEST?.guest_fname || 'Guest',
      guest_lname: item.ROOM_RESERVATION?.GUEST?.guest_lname || 'Name'
    }));

    // Send the mapped data as JSON
    return res.status(200).json(mappedCheckInData);
  } catch (err) {
    console.error('Error retrieving check-in data:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getCheckInData,
};
