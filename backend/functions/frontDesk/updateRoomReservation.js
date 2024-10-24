const { supabase } = require('../../supabaseClient');

// API to update room reservation details and handle check-in
const updateRoomReservation = async (req, res) => {
  try {
    const { room_reservation_id } = req.params;
    const { downPayment, reservationStatus, cancellationRequest, staff_id } = req.body;

    // Step 1: Update the room reservation in ROOM_RESERVATION table
    const { error: updateError } = await supabase
      .from('ROOM_RESERVATION')
      .update({
        reservation_status: reservationStatus,
        room_downpayment: downPayment,
        cancel_reservation_request: reservationStatus === 'CANCEL' ? cancellationRequest : null,
      })
      .eq('room_reservation_id', room_reservation_id);

    if (updateError) {
      console.error('Error updating room reservation:', updateError);
      return res.status(400).json({ error: updateError.message });
    }

    // Step 2: If reservation is being checked in, insert into CHECK_IN table
    if (reservationStatus === 'COMPLETED') {
      const { error: insertError } = await supabase
        .from('CHECK_IN')
        .insert({
          room_reservation_id,  
          staff_id,               
          check_in_date_time: new Date(),  
          initial_payment: null,
          payment_status: 'PENDING',
          check_in_status: 'CHECKED_IN',
        });

      if (insertError) {
        console.error('Error inserting check-in record:', insertError);
        return res.status(400).json({ error: insertError.message });
      }
    }

    return res.status(200).json({ message: 'Room reservation updated successfully' });
  } catch (error) {
    console.error('Error updating room reservation:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { updateRoomReservation };
