const { supabase } = require('../../supabaseClient');

// Function to get all drink orders without filtering by status
const getDrinkOrdersAll = async (req, res) => {
  try {
    // Step 1: Fetch all drink orders along with staff username
    const { data: drinkOrders, error: drinkOrdersError } = await supabase
      .from('BAR_ORDER')
      .select(`
        bar_order_id,
        staff_id,
        STAFF (
          staff_id,
          staff_username,
          staff_lname,
          staff_fname
        ),
        check_in_id,
        b_payment_method,
        b_order_status,
        b_order_total,
        b_order_date
      `);

    if (drinkOrdersError) {
      console.error('Error retrieving drink orders:', drinkOrdersError.message);
      return res.status(400).json({ error: drinkOrdersError.message });
    }

    // Step 2: Fetch drink order list items for the retrieved drink orders
    const drinkOrderIds = drinkOrders.map(order => order.bar_order_id);
    const { data: drinkOrderList, error: drinkOrderListError } = await supabase
      .from('BAR_ORDER_LIST')
      .select(`
        bar_order_list_id,
        bar_order_id,
        drink_id,
        b_order_qty,
        b_order_subtotal,
        BAR_DRINK (
          drink_id,
          drink_name
        )
      `)
      .in('bar_order_id', drinkOrderIds);

    if (drinkOrderListError) {
      console.error('Error retrieving drink order list:', drinkOrderListError.message);
      return res.status(400).json({ error: drinkOrderListError.message });
    }

    // Step 3: Fetch check-in, room reservation, guest, and room details for the orders
    const checkInIds = drinkOrders.map(order => order.check_in_id).filter(id => id); // Get only non-null check_in_ids
    let guestDetails = [];
    let roomDetails = [];

    if (checkInIds.length > 0) {
      // Fetch guest details
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
        .in('check_in_id', checkInIds);

      if (checkInError) {
        console.error('Error retrieving check-in data:', checkInError.message);
        return res.status(400).json({ error: checkInError.message });
      }

      guestDetails = checkInData;

      // Fetch room details
      const roomReservationIds = checkInData.map(checkIn => checkIn.room_reservation_id);
      const { data: roomData, error: roomError } = await supabase
        .from('ROOM_LIST')
        .select(`
          room_reservation_id,
          ROOM (
            room_number,
            room_type_name
          )
        `)
        .in('room_reservation_id', roomReservationIds);

      if (roomError) {
        console.error('Error retrieving room data:', roomError.message);
        return res.status(400).json({ error: roomError.message });
      }

      roomDetails = roomData;
    }

    // Step 4: Combine all data into a single response
    const combinedOrders = drinkOrders.map(order => {
      // Find the corresponding drink items, guest details, and room details for this order
      const drinkItems = drinkOrderList.filter(item => item.bar_order_id === order.bar_order_id);
      const guestInfo = guestDetails.find(guest => guest.check_in_id === order.check_in_id);
      const roomInfo = roomDetails.find(room => room.room_reservation_id === guestInfo?.room_reservation_id);

      return {
        ...order,
        drinkItems: drinkItems.map(item => ({
          ...item,
          drink_name: item.BAR_DRINK?.drink_name || 'Unknown' // Include drink name or default to 'Unknown'
        })),
        guest_fname: guestInfo?.ROOM_RESERVATION?.GUEST?.guest_fname || 'Bar',
        guest_lname: guestInfo?.ROOM_RESERVATION?.GUEST?.guest_lname || 'Guest',
        room_number: roomInfo?.ROOM?.room_number || 'N/A',
        room_type_name: roomInfo?.ROOM?.room_type_name || 'N/A'
      };
    });

    // Step 5: Send the combined data as a response
    res.status(200).json(combinedOrders);
  } catch (err) {
    console.error('Error fetching drink orders:', err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getDrinkOrdersAll };
