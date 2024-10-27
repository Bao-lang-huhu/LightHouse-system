const { supabase } = require('../../supabaseClient'); // Import Supabase client 

// API to get reservations by check_in_id
const getCheckInBill = async (req, res) => {
    const { check_in_id } = req.query;

    if (!check_in_id) {
        return res.status(400).json({ message: 'Check-in ID is required.' });
    }

    try {
        // Step 1: Fetch check-in details using check_in_id
        const { data: checkIns, error: checkInsError } = await supabase
            .from('CHECK_IN')
            .select('check_in_id, room_reservation_id, check_in_date_time, check_in_status, payment_status, staff_id')
            .eq('check_in_id', check_in_id);

        if (checkInsError) {
            console.error('Failed to fetch check-in details:', checkInsError);
            return res.status(500).json({ error: 'Failed to fetch check-in details.' });
        }

        if (!checkIns.length) {
            return res.status(404).json({ message: 'No check-in found for the provided ID.' });
        }

        const checkIn = checkIns[0];

        // Step 2: Fetch reservation details using room_reservation_id from the check-in data
        const { data: reservations, error: reservationsError } = await supabase
            .from('ROOM_RESERVATION')
            .select('room_reservation_id, room_pax, room_reservation_date, room_check_in_date, room_check_out_date, reservation_status, total_cost, guest_id, room_downpayment')
            .eq('room_reservation_id', checkIn.room_reservation_id);

        if (reservationsError) {
            console.error('Failed to fetch reservation details:', reservationsError);
            return res.status(500).json({ error: 'Failed to fetch reservation details.' });
        }

        if (!reservations.length) {
            return res.status(404).json({ message: 'No reservation found for the provided room reservation ID.' });
        }

        const reservation = reservations[0];

        // Step 3: Fetch room ID using room_reservation_id from ROOM_LIST
        const { data: roomList, error: roomListError } = await supabase
            .from('ROOM_LIST')
            .select('room_id')
            .eq('room_reservation_id', reservation.room_reservation_id);

        if (roomListError || !roomList.length) {
            console.error('Failed to fetch room ID from ROOM_LIST:', roomListError);
            return res.status(500).json({ error: 'Failed to fetch room ID.' });
        }

        const roomId = roomList[0].room_id;

        // Step 4: Fetch room details using room_id from the ROOM table
        const { data: roomDetails, error: roomError } = await supabase
            .from('ROOM')
            .select('room_id, room_type_name, room_number, room_pax_max, room_status')
            .eq('room_id', roomId);

        if (roomError || !roomDetails.length) {
            console.error('Failed to fetch room details:', roomError);
            return res.status(500).json({ error: 'Failed to fetch room details.' });
        }

        const room = roomDetails[0];

        // Step 5: Fetch guest details using guest_id from the reservation
        const { data: guests, error: guestsError } = await supabase
            .from('GUEST')
            .select('guest_id, guest_fname, guest_lname, guest_email, guest_phone_no, guest_address, guest_country, guest_gender')
            .eq('guest_id', reservation.guest_id);

        if (guestsError) {
            console.error('Failed to fetch guest details:', guestsError);
            return res.status(500).json({ error: 'Failed to fetch guest details.' });
        }

        const guest = guests[0] || {};

        // Step 6: Fetch staff details using staff_id from the check-in data
        const { data: staffMembers, error: staffError } = await supabase
            .from('STAFF')
            .select('staff_id, staff_fname, staff_lname, staff_email')
            .eq('staff_id', checkIn.staff_id);

        const staff = staffMembers && staffMembers.length ? staffMembers[0] : null;

        // Step 7: Fetch BAR_ORDER and FOOD_ORDER using check_in_id
        const { data: barOrders, error: barOrderError } = await supabase
            .from('BAR_ORDER')
            .select('bar_order_id, b_order_date, b_order_status, staff_id, b_order_total, b_payment_method, check_in_id')
            .eq('check_in_id', checkIn.check_in_id)
            .neq('b_order_status', 'DELETE');

        const { data: foodOrders, error: foodOrderError } = await supabase
            .from('FOOD_ORDER')
            .select('food_order_id, f_order_date, f_order_status, f_order_total, f_payment_method, check_in_id')
            .eq('check_in_id', checkIn.check_in_id)
            .neq('f_order_status', 'DELETE'); 

        // Fetch drink and food names based on order list associations
        const barOrderIds = barOrders.map(order => order.bar_order_id);
        const foodOrderIds = foodOrders.map(order => order.food_order_id);

        const { data: barOrderList, error: barOrderListError } = await supabase
            .from('BAR_ORDER_LIST')
            .select('bar_order_id, drink_id')
            .in('bar_order_id', barOrderIds);

        const { data: foodOrderList, error: foodOrderListError } = await supabase
            .from('FOOD_ORDER_LIST')
            .select('food_order_id, food_id')
            .in('food_order_id', foodOrderIds);

        const drinkIds = barOrderList.map(item => item.drink_id);
        const foodIds = foodOrderList.map(item => item.food_id);

        const { data: drinks, error: drinksError } = await supabase
            .from('BAR_DRINK')
            .select('drink_id, drink_name')
            .in('drink_id', drinkIds);

        const { data: foods, error: foodsError } = await supabase
            .from('FOOD_ITEM')
            .select('food_id, food_name')
            .in('food_id', foodIds);

        const barOrdersWithDrinks = barOrders.map(order => {
            const drinksForOrder = barOrderList
                .filter(item => item.bar_order_id === order.bar_order_id)
                .map(item => drinks.find(drink => drink.drink_id === item.drink_id)?.drink_name || 'Unknown Drink');
            return {
                ...order,
                drinks: drinksForOrder,
            };
        });

        const foodOrdersWithFoods = foodOrders.map(order => {
            const foodsForOrder = foodOrderList
                .filter(item => item.food_order_id === order.food_order_id)
                .map(item => foods.find(food => food.food_id === item.food_id)?.food_name || 'Unknown Food');
            return {
                ...order,
                foods: foodsForOrder,
            };
        });

        const { data: laundryData, error: laundryError } = await supabase
            .from('LAUNDRY')
            .select('laun_total_price')
            .eq('check_in_id', check_in_id);

        if (laundryError) {
            console.error('Failed to fetch laundry data:', laundryError);
            return res.status(500).json({ error: 'Failed to fetch laundry data.' });
        }

        const totalLaundryCost = laundryData.reduce((sum, item) => sum + (item.laun_total_price || 0), 0);

        // Additional Step: Fetch CONCIERGE details using check_in_id
        const { data: conciergeData, error: conciergeError } = await supabase
            .from('CONCIERGE')
            .select('av_concierge_total_price')
            .eq('check_in_id', check_in_id);

        if (conciergeError) {
            console.error('Failed to fetch concierge data:', conciergeError);
            return res.status(500).json({ error: 'Failed to fetch concierge data.' });
        }

        const totalConciergeCost = conciergeData.reduce((sum, item) => sum + (item.av_concierge_total_price || 0), 0);

        // Calculate the grand total
        const grandTotal = (reservation.total_cost || 0) + totalLaundryCost + totalConciergeCost;

        // Combine all fetched details
        const result = {
            ...reservation,
            room,
            guest,
            checkIn,
            staff,
            barOrders: barOrdersWithDrinks,
            foodOrders: foodOrdersWithFoods,
            totalLaundryCost,
            totalConciergeCost,
            grandTotal
        };

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching reservation bill:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { getCheckInBill };