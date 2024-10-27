const { supabase } = require('../../supabaseClient');

const getConciergesGuest = async (req, res) => {
    try {
        // Fetch ongoing concierge services with related check-in data
        const { data: conciergeData, error: conciergeError } = await supabase
            .from('CONCIERGE')
            .select(`
                av_concierge_id,
                check_in_id,  
                av_concierge_status
            `)
            .eq('av_concierge_status', 'ONGOING');

        if (conciergeError) {
            console.error('Error fetching concierge data:', conciergeError);
            return res.status(500).json({ error: conciergeError.message });
        }

        // Fetch related check-in data with guest details
        const { data: checkInData, error: checkInError } = await supabase
            .from('CHECK_IN')
            .select(`
                check_in_id,
                room_reservation_id,
                ROOM_RESERVATION (
                    guest_id,
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

        // Fetch room list data to get room numbers
        const { data: roomListData, error: roomListError } = await supabase
            .from('ROOM_LIST')
            .select(`
                room_reservation_id,
                ROOM (
                    room_id,
                    room_number
                )
            `);

        if (roomListError) {
            console.error('Error fetching room list data:', roomListError);
            return res.status(500).json({ error: roomListError.message });
        }

        // Combine all data based on relationships
        const combinedData = conciergeData.map(conciergeItem => {
            // Match with CHECK_IN based on check_in_id
            const checkInMatch = checkInData.find(checkIn => checkIn.check_in_id === conciergeItem.check_in_id);

            if (!checkInMatch) return null;

            // Get guest details from ROOM_RESERVATION
            const guestDetails = checkInMatch.ROOM_RESERVATION?.GUEST;
            
            // Match with ROOM_LIST based on room_reservation_id
            const roomListMatch = roomListData.find(roomList => roomList.room_reservation_id === checkInMatch.room_reservation_id);
            
            return {
                av_concierge_id: conciergeItem.av_concierge_id,
                check_in_id: conciergeItem.check_in_id, // Include check_in_id here
                room_number: roomListMatch ? roomListMatch.ROOM.room_number : 'N/A',
                guest_fname: guestDetails ? guestDetails.guest_fname : 'N/A',
                guest_lname: guestDetails ? guestDetails.guest_lname : 'N/A',
            };
        }).filter(item => item !== null); // Filter out any null values

        res.status(200).json(combinedData);
    } catch (err) {
        console.error('Error retrieving ongoing concierge services:', err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { getConciergesGuest };
