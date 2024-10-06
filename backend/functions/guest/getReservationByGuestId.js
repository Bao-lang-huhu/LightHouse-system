const { supabase } = require('../../supabaseClient'); // Import Supabase client

// API to get reservations by guest ID
const getReservationsByGuestId = async (req, res) => {
    const { guest_id } = req.query;

    if (!guest_id) {
        console.log('Guest ID not provided');
        return res.status(400).json({ message: 'Guest ID is required.' });
    }

    try {
        // Step 1: Fetch reservations by guest_id
        console.log(`Fetching reservations for guest_id: ${guest_id}`);
        const { data: reservations, error: reservationsError } = await supabase
            .from('ROOM_RESERVATION')
            .select('room_reservation_id,room_reservation_date, room_check_in_date, room_check_out_date, reservation_status, total_cost, cancel_reservation_request')
            .eq('guest_id', guest_id);

        if (reservationsError) {
            console.error('Error fetching reservations:', reservationsError);
            return res.status(500).json({ error: 'Failed to fetch reservations' });
        }

        // Log the fetched reservations
        console.log('Fetched reservations:', reservations);

        // If no reservations found, return a message
        if (!reservations.length) {
            console.log('No reservations found for this guest.');
            return res.status(404).json({ message: 'No reservations found for this guest.' });
        }

        // Step 2: Fetch room_id from ROOM_LIST by matching room_reservation_id
        const reservationIds = reservations.map(reservation => reservation.room_reservation_id);
        console.log('Fetching room IDs for reservation IDs:', reservationIds);

        const { data: roomList, error: roomListError } = await supabase
            .from('ROOM_LIST')
            .select('room_reservation_id, room_id')
            .in('room_reservation_id', reservationIds);

        if (roomListError) {
            console.error('Error fetching room IDs:', roomListError);
            return res.status(500).json({ error: 'Failed to fetch room IDs' });
        }

        // Log the fetched room IDs
        console.log('Fetched room IDs:', roomList);

        // Step 3: Fetch room details (room_type_name and room_number) for each room_id
        const roomIds = roomList.map(item => item.room_id);
        console.log('Fetching room details for room IDs:', roomIds);

        const { data: rooms, error: roomsError } = await supabase
            .from('ROOM')
            .select('room_id, room_type_name, room_number')
            .in('room_id', roomIds);

        if (roomsError) {
            console.error('Error fetching room details:', roomsError);
            return res.status(500).json({ error: 'Failed to fetch room details' });
        }

        // Log the fetched room details
        console.log('Fetched room details:', rooms);

        // Step 4: Map room details to the reservations
        const reservationsWithRooms = reservations.map(reservation => {
            const roomItem = roomList.find(item => item.room_reservation_id === reservation.room_reservation_id);

            // Safeguard: Check if roomItem and room exist before accessing room properties
            if (!roomItem) {
                console.error(`No room found for reservation ID: ${reservation.room_reservation_id}`);
                return { ...reservation, room_type_name: 'Unknown', room_number: 'Unknown' };
            }

            const room = rooms.find(room => room.room_id === roomItem.room_id);
            if (!room) {
                console.error(`No room details found for room ID: ${roomItem.room_id}`);
                return { ...reservation, room_type_name: 'Unknown', room_number: 'Unknown' };
            }

            return {
                ...reservation,
                room_type_name: room.room_type_name || 'Unknown',
                room_number: room.room_number || 'Unknown',
            };
        });

        // Log the final reservations with room details
        console.log('Reservations with room details:', reservationsWithRooms);

        // Step 5: Return reservations with room details in response as JSON
        return res.status(200).json(reservationsWithRooms);
    } catch (error) {
        console.error('Error fetching reservations:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { getReservationsByGuestId };
