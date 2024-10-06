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
        check_in_status
      `);

    if (error) {
      console.error('Error fetching check-in data:', error.message);
      return res.status(500).json({ error: 'Error fetching check-in data' });
    }

    // If data is found, send it as JSON
    res.status(200).json(checkInData);
  } catch (err) {
    console.error('Error retrieving check-in data:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getCheckInData,
};
