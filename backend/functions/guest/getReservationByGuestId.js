const { supabase } = require('../../supabaseClient'); // Import Supabase client

// API to get reservations by guest ID
const getReservationsByGuestId = async (req, res) => {
    const { guest_id } = req.query;

    if (!guest_id) {
        console.log('Guest ID not provided');
        return res.status(400).json({ message: 'Guest ID is required.' });
    }

    try {
        console.log(`Fetching reservations for guest_id: ${guest_id}`);
        const { data: reservations, error: reservationsError } = await supabase
            .from('ROOM_RESERVATION')
            .select('room_reservation_id, room_reservation_date, room_check_in_date, room_check_out_date, reservation_status, total_cost, cancel_reservation_request')
            .eq('guest_id', guest_id);

        if (reservationsError) {
            console.error('Error fetching reservations:', reservationsError);
            return res.status(500).json({ error: 'Failed to fetch reservations' });
        }

        if (!reservations.length) {
            console.log('No reservations found for this guest.');
            return res.status(404).json({ message: 'No reservations found for this guest.' });
        }

        const reservationIds = reservations.map(reservation => reservation.room_reservation_id);

        const { data: roomList, error: roomListError } = await supabase
            .from('ROOM_LIST')
            .select('room_reservation_id, room_id')
            .in('room_reservation_id', reservationIds);

        if (roomListError) {
            console.error('Error fetching room IDs:', roomListError);
            return res.status(500).json({ error: 'Failed to fetch room IDs' });
        }

        const roomIds = roomList.map(item => item.room_id);

        const { data: rooms, error: roomsError } = await supabase
            .from('ROOM')
            .select('room_id, room_type_name, room_number')
            .in('room_id', roomIds);

        if (roomsError) {
            console.error('Error fetching room details:', roomsError);
            return res.status(500).json({ error: 'Failed to fetch room details' });
        }

        // NEW: Fetching room photos where room_slot is 'MAIN'
        const { data: roomPhotos, error: roomPhotosError } = await supabase
            .from('ROOM_PHOTO_LIST')
            .select('room_id, room_photo_url')
            .eq('room_slot', 'MAIN')  // Only fetch photos with room_slot = 'MAIN'
            .in('room_id', roomIds);

        if (roomPhotosError) {
            console.error('Error fetching room photos:', roomPhotosError);
            return res.status(500).json({ error: 'Failed to fetch room photos' });
        }

        // Map reservations with room details and main photo
        const reservationsWithRooms = reservations.map(reservation => {
            const roomItem = roomList.find(item => item.room_reservation_id === reservation.room_reservation_id);

            if (!roomItem) {
                return { ...reservation, room_type_name: 'Unknown', room_number: 'Unknown', room_photo: null };
            }

            const room = rooms.find(room => room.room_id === roomItem.room_id);
            const roomPhoto = roomPhotos.find(photo => photo.room_id === roomItem.room_id);

            return {
                ...reservation,
                room_type_name: room ? room.room_type_name : 'Unknown',
                room_number: room ? room.room_number : 'Unknown',
                room_photo: roomPhoto ? roomPhoto.room_photo_url : null,  // Assign the main photo URL
            };
        });

        console.log('Reservations with room details and photos:', reservationsWithRooms);

        return res.status(200).json(reservationsWithRooms);
    } catch (error) {
        console.error('Error fetching reservations:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { getReservationsByGuestId };
