const { supabase } = require('../../supabaseClient');

const getCheckedInGuests = async (req, res) => {
    try {
        const { data: checkInData, error: checkInError } = await supabase
            .from('CHECK_IN')
            .select(`
                check_in_id,
                room_reservation_id,
                ROOM_RESERVATION (
                    room_reservation_id,
                    guest_id,
                    GUEST (
                        guest_id,
                        guest_fname,
                        guest_lname
                    )
                )
            `)
            .eq('check_in_status', 'CHECKED_IN');

        if (checkInError) {
            console.error('Error fetching check-in data:', checkInError);
            return res.status(500).json({ error: checkInError.message });
        }

        // Fetching ROOM_LIST and ROOM data
        const { data: roomListData, error: roomListError } = await supabase
            .from('ROOM_LIST')
            .select(`
                room_reservation_id,
                room_id,
                ROOM (
                    room_id,
                    room_number,
                    room_type_name
                )
            `);

        if (roomListError) {
            console.error('Error fetching room list data:', roomListError);
            return res.status(500).json({ error: roomListError.message });
        }

        // Combining CHECK_IN data with ROOM_LIST data based on room_reservation_id
        const combinedData = checkInData.map(checkInItem => {
            const matchingRoomList = roomListData.find(roomListItem => roomListItem.room_reservation_id === checkInItem.room_reservation_id);
            
            return {
                check_in_id: checkInItem.check_in_id,
                guest_fname: checkInItem.ROOM_RESERVATION.GUEST.guest_fname,
                guest_lname: checkInItem.ROOM_RESERVATION.GUEST.guest_lname,
                room_number: matchingRoomList ? matchingRoomList.ROOM.room_number : 'N/A',
                room_type_name: matchingRoomList ? matchingRoomList.ROOM.room_type_name : 'N/A'
            };
        });

        res.status(200).json(combinedData);
    } catch (err) {
        console.error('Error retrieving checked-in guests:', err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { getCheckedInGuests };
