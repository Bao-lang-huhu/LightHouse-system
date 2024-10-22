const { supabase } = require('../../supabaseClient'); // Import Supabase client

// API to get reservations by reservation ID
const getReservationsByReservationId = async (req, res) => {
    const { room_reservation_id } = req.query;

    if (!room_reservation_id) {
        return res.status(400).json({ message: 'Room reservation ID is required.' });
    }

    try {
        // Step 1: Fetch reservation details
        const { data: reservations, error: reservationsError } = await supabase
            .from('ROOM_RESERVATION')
            .select('room_reservation_id, room_pax, room_reservation_date, room_check_in_date, room_check_out_date, reservation_status, total_cost, guest_id')
            .eq('room_reservation_id', room_reservation_id);

        if (reservationsError || !reservations.length) {
            return res.status(500).json({ error: 'Failed to fetch reservations or no reservations found.' });
        }

        // Step 2: Fetch room IDs based on room_reservation_id
        const reservationIds = reservations.map(reservation => reservation.room_reservation_id);
        const { data: roomList, error: roomListError } = await supabase
            .from('ROOM_LIST')
            .select('room_reservation_id, room_id')
            .in('room_reservation_id', reservationIds);

        if (roomListError || !roomList.length) {
            return res.status(500).json({ error: 'Failed to fetch room IDs or no room IDs found.' });
        }

        // Step 3: Fetch room details
        const roomIds = roomList.map(item => item.room_id);
        const { data: rooms, error: roomsError } = await supabase
            .from('ROOM')
            .select('room_id, room_type_name, room_number')
            .in('room_id', roomIds);

        if (roomsError || !rooms.length) {
            return res.status(500).json({ error: 'Failed to fetch room details or no room details found.' });
        }

        // Step 4: Fetch room photos from ROOM_PHOTO_LIST
        const { data: roomPhotos, error: roomPhotosError } = await supabase
            .from('ROOM_PHOTO_LIST')
            .select('room_id, room_slot, room_photo_url')
            .in('room_id', roomIds);

        if (roomPhotosError || !roomPhotos.length) {
            return res.status(500).json({ error: 'Failed to fetch room photos or no photos found.' });
        }

        // Step 5: Map room photos to MAIN and EXTRA
        const roomPhotosByRoomId = roomIds.reduce((acc, roomId) => {
            const photos = roomPhotos.filter(photo => photo.room_id === roomId);
            const mainPhoto = photos.find(photo => photo.room_slot === 'MAIN') || { room_photo_url: 'https://via.placeholder.com/600x400' };
            const extraPhotos = photos.filter(photo => photo.room_slot !== 'MAIN').map(photo => photo.room_photo_url);
            acc[roomId] = { main: mainPhoto.room_photo_url, extra: extraPhotos };
            return acc;
        }, {});

        // Step 6: Map room details and room photos to reservations
        const reservationsWithRoomsAndPhotos = reservations.map(reservation => {
            const roomItem = roomList.find(item => item.room_reservation_id === reservation.room_reservation_id);
            const room = rooms.find(room => room.room_id === roomItem.room_id);
            const roomPhotos = roomPhotosByRoomId[roomItem.room_id];

            return {
                ...reservation,
                room_type_name: room?.room_type_name || 'Unknown',
                room_number: room?.room_number || 'Unknown',
                images: roomPhotos || { main: 'https://via.placeholder.com/600x400', extra: [] },
            };
        });

        return res.status(200).json(reservationsWithRoomsAndPhotos);
    } catch (error) {
        console.error('Error fetching reservations:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { getReservationsByReservationId };
