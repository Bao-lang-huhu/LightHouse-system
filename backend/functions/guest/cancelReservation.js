const { supabase } = require('../../supabaseClient'); // Import Supabase client

const cancelReservation = async (req, res) => {
    const { room_reservation_id, cancel_reason } = req.body;

    // Check if room_reservation_id and cancel_reason are provided
    if (!room_reservation_id || !cancel_reason) {
        return res.status(400).json({ message: 'Room reservation ID and cancellation reason are required.' });
    }

    try {
        const { data, error } = await supabase
            .from('ROOM_RESERVATION')
            .update({
                reservation_status: 'CANCELED',
                cancel_reserve_date: new Date().toISOString(), // Store the current timestamp
                cancel_reservation_request: cancel_reason      // Store the cancellation reason
            })
            .eq('room_reservation_id', room_reservation_id);    // Match the reservation by ID

        if (error) {
            console.error('Error updating reservation:', error);
            return res.status(500).json({ error: 'Failed to cancel reservation' });
        }

        // If the update was successful, return a success message
        return res.status(200).json({ message: 'Reservation cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling reservation:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { cancelReservation };
