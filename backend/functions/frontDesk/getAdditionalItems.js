const { supabase } = require('../../supabaseClient');

const getAdditionalItems = async (req, res) => {
    try {
        // Step 1: Fetch additional items
        const { data: additionalItems, error: additionalItemsError } = await supabase
            .from('ADDITIONAL_ITEM')
            .select(`
                add_item_id,
                add_item_name,
                add_item_borrowed_date,
                add_item_returned_date,
                add_item_status,
                check_in_id
            `);

        if (additionalItemsError) {
            console.error('Error fetching additional items:', additionalItemsError);
            return res.status(500).json({ error: additionalItemsError.message });
        }

        // Step 2: Fetch check-ins with room reservation and guest details, adjusted to fetch `room_id` from `ROOM_LIST`
        const { data: checkIns, error: checkInError } = await supabase
            .from('CHECK_IN')
            .select(`
                check_in_id,
                room_reservation_id,
                ROOM_RESERVATION (
                    guest_id,
                    ROOM_LIST (
                        room_id
                    ),
                    GUEST (
                        guest_id,
                        guest_fname,
                        guest_lname
                    )
                )
            `);

        if (checkInError) {
            console.error('Error fetching check-in data:', checkInError);
            return res.status(500).json({ error: checkInError.message });
        }

        // Step 3: Fetch room details from ROOM_LIST and ROOM tables
        const { data: roomList, error: roomListError } = await supabase
            .from('ROOM_LIST')
            .select(`
                room_reservation_id,
                room_id,
                ROOM (
                    room_id,
                    room_type_name,
                    room_number
                )
            `);

        if (roomListError) {
            console.error('Error fetching room list:', roomListError);
            return res.status(500).json({ error: roomListError.message });
        }

        // Step 4: Combine additional items data with guest and room information
        const combinedData = additionalItems.map(item => {
            const matchingCheckIn = checkIns.find(checkIn => checkIn.check_in_id === item.check_in_id);

            if (matchingCheckIn) {
                const matchingRoom = roomList.find(room => room.room_reservation_id === matchingCheckIn.room_reservation_id);

                return {
                    add_item_id: item.add_item_id,
                    add_item_name: item.add_item_name,
                    add_item_borrowed_date: item.add_item_borrowed_date,
                    add_item_returned_date: item.add_item_returned_date,
                    add_item_status: item.add_item_status,
                    guest_fname: matchingCheckIn.ROOM_RESERVATION.GUEST.guest_fname,
                    guest_lname: matchingCheckIn.ROOM_RESERVATION.GUEST.guest_lname,
                    room_type_name: matchingRoom?.ROOM.room_type_name || 'N/A',
                    room_number: matchingRoom?.ROOM.room_number || 'N/A'
                };
            }
            return item;
        });

        // Return the combined data
        res.status(200).json(combinedData);
    } catch (err) {
        console.error('Error retrieving additional items:', err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { getAdditionalItems };
