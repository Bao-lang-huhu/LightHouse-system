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
        room_id,  
        total_cost,
    } = req.body;

    const room_reservation_id = uuidv4(); // Generate a unique ID for each reservation

    try {
        console.log("Received reservation data:", req.body);

        console.log('Inserting new reservation into ROOM_RESERVATION...');
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

        console.log('ROOM_RESERVATION inserted successfully:', reservationData);

        // Insert the room in ROOM_LIST with the generated room_reservation_id
        const roomListEntry = {
            list_room_id: uuidv4(),
            room_id,
            room_reservation_id
        };

        console.log("Room list entry to be inserted:", roomListEntry);

        const { data: roomListData, error: roomListError } = await supabase
            .from('ROOM_LIST')
            .insert([roomListEntry]);

        if (roomListError) {
            console.error('Error inserting into ROOM_LIST:', roomListError.message);
            return res.status(400).json({ error: roomListError.message });
        }

        console.log('ROOM_LIST entry inserted successfully:', roomListData);

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
