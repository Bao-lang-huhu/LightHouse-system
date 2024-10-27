const { supabase } = require('../../supabaseClient'); // Import Supabase client

// API to get reservations by reservation ID
const getCheckIn = async (req, res) => {
    const { room_reservation_id } = req.query;

    if (!room_reservation_id) {
        return res.status(400).json({ message: 'Room reservation ID is required.' });
    }

    try {
        // Step 1: Fetch reservation details
        const { data: reservations, error: reservationsError } = await supabase
            .from('ROOM_RESERVATION')
            .select('room_reservation_id, room_pax, room_reservation_date, room_check_in_date, room_check_out_date, reservation_status, total_cost, guest_id, room_downpayment')
            .eq('room_reservation_id', room_reservation_id);

        if (reservationsError || !reservations.length) {
            return res.status(500).json({ error: 'Failed to fetch reservations or no reservations found.' });
        }

        const guestIds = reservations.map(reservation => reservation.guest_id);
        const { data: guests, error: guestsError } = await supabase
            .from('GUEST')
            .select('guest_id, guest_fname, guest_lname, guest_email, guest_phone_no, guest_address, guest_country, guest_gender')
            .in('guest_id', guestIds);

        if (guestsError || !guests.length) {
            return res.status(500).json({ error: 'Failed to fetch guest details or no guest details found.' });
        }

        const reservationIds = reservations.map(reservation => reservation.room_reservation_id);
        const { data: checkIns, error: checkInsError } = await supabase
            .from('CHECK_IN')
            .select('room_reservation_id, check_in_date_time, check_in_status, payment_status, check_in_status, staff_id')
            .in('room_reservation_id', reservationIds);

        if (checkInsError) {
            return res.status(500).json({ error: 'Failed to fetch check-in details.' });
        }

        // Step 4: Fetch staff details from the STAFF table using staff IDs from CHECK_IN
        const staffIds = checkIns.map(checkIn => checkIn.staff_id).filter(staffId => staffId !== null);
        const { data: staffMembers, error: staffError } = await supabase
            .from('STAFF')
            .select('staff_id, staff_fname, staff_lname, staff_email')
            .in('staff_id', staffIds);

        if (staffError) {
            return res.status(500).json({ error: 'Failed to fetch staff details.' });
        }

        // Step 5: Fetch room IDs based on room_reservation_id
        const { data: roomList, error: roomListError } = await supabase
            .from('ROOM_LIST')
            .select('room_reservation_id, room_id')
            .in('room_reservation_id', reservationIds);

        if (roomListError || !roomList.length) {
            return res.status(500).json({ error: 'Failed to fetch room IDs or no room IDs found.' });
        }

        // Step 6: Fetch room details
        const roomIds = roomList.map(item => item.room_id);
        const { data: rooms, error: roomsError } = await supabase
            .from('ROOM')
            .select('room_id, room_type_name, room_number')
            .in('room_id', roomIds);

        if (roomsError || !rooms.length) {
            return res.status(500).json({ error: 'Failed to fetch room details or no room details found.' });
        }

        // Step 7: Fetch room photos from ROOM_PHOTO_LIST
        const { data: roomPhotos, error: roomPhotosError } = await supabase
            .from('ROOM_PHOTO_LIST')
            .select('room_id, room_slot, room_photo_url')
            .in('room_id', roomIds);

        if (roomPhotosError || !roomPhotos.length) {
            return res.status(500).json({ error: 'Failed to fetch room photos or no photos found.' });
        }

        // Step 8: Map room photos to MAIN and EXTRA
        const roomPhotosByRoomId = roomIds.reduce((acc, roomId) => {
            const photos = roomPhotos.filter(photo => photo.room_id === roomId);
            const mainPhoto = photos.find(photo => photo.room_slot === 'MAIN') || { room_photo_url: 'https://via.placeholder.com/600x400' };
            const extraPhotos = photos.filter(photo => photo.room_slot !== 'MAIN').map(photo => photo.room_photo_url);
            acc[roomId] = { main: mainPhoto.room_photo_url, extra: extraPhotos };
            return acc;
        }, {});

        // Step 9: Map details to reservations
        const reservationsWithDetails = reservations.map(reservation => {
            const roomItem = roomList.find(item => item.room_reservation_id === reservation.room_reservation_id);
            const room = rooms.find(room => room.room_id === roomItem.room_id);
            const roomPhotos = roomPhotosByRoomId[roomItem.room_id];
            const guest = guests.find(g => g.guest_id === reservation.guest_id);
            const checkIn = checkIns.find(c => c.room_reservation_id === reservation.room_reservation_id);
            const staff = checkIn ? staffMembers.find(s => s.staff_id === checkIn.staff_id) : null;

            return {
                ...reservation,
                room_type_name: room?.room_type_name || 'Unknown',
                room_number: room?.room_number || 'Unknown',
                images: roomPhotos || { main: 'https://via.placeholder.com/600x400', extra: [] },
                guest: guest || {},
                checkIn: checkIn || {},
                staff: staff || {},
            };
        });

        return res.status(200).json(reservationsWithDetails);
    } catch (error) {
        console.error('Error fetching reservations:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { getCheckIn };
