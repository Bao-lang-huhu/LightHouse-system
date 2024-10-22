const { supabase } = require('../../supabaseClient'); // Import Supabase client 

const cancelEventReservation = async (req, res) => {
    const { event_reservation_id, cancel_reason } = req.body;

    // Check if event_reservation_id is provided
    if (!event_reservation_id) {
        console.log('Event reservation ID not provided');
        return res.status(400).json({ message: 'Event reservation ID is required.' });
    }

    try {
        // Step 1: Check if the reservation exists
        const { data: existingReservation, error: fetchError } = await supabase
            .from('EVENT_RESERVATION')
            .select('*')
            .eq('event_reservation_id', event_reservation_id)
            .single();

        if (fetchError || !existingReservation) {
            console.log(`Reservation not found for ID: '${event_reservation_id}'`);
            return res.status(404).json({ message: 'Reservation not found.' });
        }

        // Step 2: Update the reservation with cancellation details
        const { error: updateError } = await supabase
            .from('EVENT_RESERVATION')
            .update({ 
                event_status: 'CANCELED', 
                cancel_reservation_request: cancel_reason // Store the cancel reason
            })
            .eq('event_reservation_id', event_reservation_id);

        if (updateError) {
            console.error('Error updating reservation status:', updateError);
            return res.status(500).json({ message: 'Failed to cancel reservation.' });
        }

        console.log(`Successfully canceled reservation: ${event_reservation_id}`);
        return res.status(200).json({ message: 'Reservation canceled successfully.' });
    } catch (error) {
        console.error('Error canceling reservation:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { cancelEventReservation };
