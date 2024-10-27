const { supabase } = require('../../supabaseClient');

// API to update event reservation details
const updateEventReservation = async (req, res) => {
  try {
    const { event_reservation_id } = req.params;
    const { downPayment, reservationStatus, cancellationRequest } = req.body;

    // Update the event reservation in EVENT_RESERVATION table
    const { error: updateError } = await supabase
      .from('EVENT_RESERVATION')
      .update({
        event_status: reservationStatus,
        event_downpayment: downPayment,
        cancel_reservation_request: reservationStatus === 'CANCELED' ? cancellationRequest : null,
      })
      .eq('event_reservation_id', event_reservation_id);

    if (updateError) {
      console.error('Error updating event reservation:', updateError);
      return res.status(400).json({ error: updateError.message });
    }

    return res.status(200).json({ message: 'Event reservation updated successfully' });
  } catch (error) {
    console.error('Error updating event reservation:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { updateEventReservation };
