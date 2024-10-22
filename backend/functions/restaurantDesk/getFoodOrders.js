const { supabase } = require('../../supabaseClient');

// Function to get ongoing food orders
const getFoodOrders = async (req, res) => {
  try {
    // Step 1: Fetch ongoing food orders along with staff username
    const { data: foodOrders, error: foodOrdersError } = await supabase
      .from('FOOD_ORDER')
      .select(`
        food_order_id,
        staff_id,
        STAFF (
          staff_id,
          staff_username,
          staff_fname,
          staff_lname
        ),
        check_in_id,
        f_payment_method,
        f_order_status,
        f_order_total,
        f_order_date,
        f_notes
      `)
      .eq('f_order_status', 'ONGOING'); // Only get ONGOING orders

    if (foodOrdersError) {
      console.error('Error retrieving food orders:', foodOrdersError.message);
      return res.status(400).json({ error: foodOrdersError.message });
    }

    // Step 2: Fetch food order list items for the retrieved food orders
    const foodOrderIds = foodOrders.map(order => order.food_order_id);
    const { data: foodOrderList, error: foodOrderListError } = await supabase
      .from('FOOD_ORDER_LIST')
      .select(`
        food_order_list_id,
        food_order_id,
        food_id,
        f_order_qty,
        f_order_subtotal,
        FOOD_ITEM (
          food_id,
          food_name
        )
      `)
      .in('food_order_id', foodOrderIds);

    if (foodOrderListError) {
      console.error('Error retrieving food order list:', foodOrderListError.message);
      return res.status(400).json({ error: foodOrderListError.message });
    }

    // Step 3: Fetch check-in, room reservation, guest, and room details for the orders
    const checkInIds = foodOrders.map(order => order.check_in_id).filter(id => id); // Get only non-null check_in_ids
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
    const combinedOrders = foodOrders.map(order => {
      // Find the corresponding food items, guest details, and room details for this order
      const foodItems = foodOrderList.filter(item => item.food_order_id === order.food_order_id);
      const guestInfo = guestDetails.find(guest => guest.check_in_id === order.check_in_id);
      const roomInfo = roomDetails.find(room => room.room_reservation_id === guestInfo?.room_reservation_id);

      return {
        ...order,
        staff_username: order.STAFF?.staff_username || 'Unknown',
        staff_fname: order.STAFF?.staff_fname || 'Unknown', 
        staff_lname: order.STAFF?.staff_lname || 'Unknown',// Include staff username or default to 'Unknown'
        foodItems: foodItems.map(item => ({
          ...item,
          food_name: item.FOOD_ITEM?.food_name || 'Unknown' // Include food name or default to 'Unknown'
        })),
        guest_fname: guestInfo?.ROOM_RESERVATION?.GUEST?.guest_fname || 'Restaurant',
        guest_lname: guestInfo?.ROOM_RESERVATION?.GUEST?.guest_lname || 'Guest',
        room_number: roomInfo?.ROOM?.room_number || 'N/A',
        room_type_name: roomInfo?.ROOM?.room_type_name || 'N/A'
      };
    });

    // Step 5: Send the combined data as a response
    res.status(200).json(combinedOrders);
  } catch (err) {
    console.error('Error fetching food orders:', err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getFoodOrders };
