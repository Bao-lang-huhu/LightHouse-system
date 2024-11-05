const { supabase } = require('../supabaseClient'); 
const { v4: uuidv4 } = require('uuid'); 

const registerRoomReservation = async (req, res) => {
    const {
        room_reservation_date,
        room_check_in_date,
        room_check_out_date,
        room_is_breakfast,
        room_pax,
        room_notes,
        room_company,
        room_downpayment,
        cancel_reservation_request,
        reservation_status,
        guest_id,
        room_ids,  // Expect an array of room IDs to reserve multiple rooms
        total_cost,
    } = req.body;

    // Use an existing reservation ID if provided; otherwise, create a new one
    const room_reservation_id = req.body.room_reservation_id || uuidv4(); 

    try {
        // Check if this is a new reservation or additional rooms for an existing reservation
        if (!req.body.room_reservation_id) {
            // Insert into the ROOM_RESERVATION table only if it's a new reservation
            const { data: reservationData, error: reservationError } = await supabase
                .from('ROOM_RESERVATION')
                .insert([{
                    room_reservation_id,
                    room_reservation_date,
                    room_check_in_date,
                    room_check_out_date,
                    room_is_breakfast,
                    room_pax,
                    room_notes,
                    room_company,
                    room_downpayment,
                    cancel_reservation_request,
                    reservation_status,
                    total_cost,
                    guest_id,
                }]);

            if (reservationError) {
                console.error('Error inserting into ROOM_RESERVATION:', reservationError.message);
                return res.status(400).json({ error: reservationError.message });
            }
        }

        // Insert each room in ROOM_LIST with the same room_reservation_id
        const roomListEntries = room_ids.map((room_id) => ({
            list_room_id: uuidv4(),
            room_id,
            room_reservation_id
        }));

        const { data: roomListData, error: roomListError } = await supabase
            .from('ROOM_LIST')
            .insert(roomListEntries);

        if (roomListError) {
            console.error('Error inserting into ROOM_LIST:', roomListError.message);
            return res.status(400).json({ error: roomListError.message });
        }

        res.status(201).json({
            message: "Room reservation registered successfully and ROOM_LIST updated!",
            reservationData: { room_reservation_id },
            roomListData
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { registerRoomReservation };
