const { supabase } = require('../supabaseClient');

const getRoomSales = async (req, res) => {
    const type = req.query.type || 'monthly'; // Default to 'monthly' if not specified
    try {
        const { data: checkIns, error: checkInError } = await supabase
            .from('CHECK_IN')
            .select('room_reservation_id, check_in_date_time')
            .eq('payment_status', 'PAID');

        if (checkInError) {
            console.error(`Error fetching CHECK_IN data: ${checkInError.message}`);
            return res.status(500).json({ error: 'Error fetching CHECK_IN data' });
        }

        const roomReservationIds = checkIns.map(checkIn => checkIn.room_reservation_id);

        const { data: roomReservations, error: roomReservationError } = await supabase
            .from('ROOM_RESERVATION')
            .select('room_reservation_id, total_cost')
            .in('room_reservation_id', roomReservationIds);

        if (roomReservationError) {
            console.error(`Error fetching ROOM_RESERVATION data: ${roomReservationError.message}`);
            return res.status(500).json({ error: 'Error fetching ROOM_RESERVATION data' });
        }

        const salesData = {};
        checkIns.forEach(checkIn => {
            const roomReservation = roomReservations.find(reservation => reservation.room_reservation_id === checkIn.room_reservation_id);
            if (roomReservation) {
                const checkInDate = new Date(checkIn.check_in_date_time);
                let key;
                if (type === 'yearly') {
                    key = `${checkInDate.getFullYear()}`;
                } else {
                    key = `${checkInDate.getFullYear()}-${String(checkInDate.getMonth() + 1).padStart(2, '0')}`;
                }

                if (!salesData[key]) {
                    salesData[key] = 0;
                }

                salesData[key] += roomReservation.total_cost || 0;
            }
        });

        const result = Object.entries(salesData).map(([key, totalSales]) => ({
            period: key,
            totalSales
        }));

        res.status(200).json(result);
    } catch (error) {
        console.error('Error processing room sales data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getRoomSales };
