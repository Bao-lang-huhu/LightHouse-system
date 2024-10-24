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
        initial_payment,
        payment_status,
        check_in_status,
        STAFF (
          staff_id,
          staff_fname,
          staff_lname
        ),
        ROOM_RESERVATION (
          room_downpayment
        )
      `);

    if (error) {
      console.error('Error fetching check-in data:', error.message);
      return res.status(500).json({ error: 'Error fetching check-in data' });
    }

    // Map the response to extract and include staff details and downpayment
    const mappedCheckInData = checkInData.map(item => ({
      ...item,
      staff_fname: item.STAFF?.staff_fname || 'Unknown',
      staff_lname: item.STAFF?.staff_lname || 'Staff',
      room_downpayment: item.ROOM_RESERVATION?.room_downpayment !== null ? item.ROOM_RESERVATION.room_downpayment : 0 // Default to 0 if null
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
