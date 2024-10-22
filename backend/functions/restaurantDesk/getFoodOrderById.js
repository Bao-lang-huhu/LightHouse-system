const { supabase } = require('../../supabaseClient');

// Function to get a specific food order by ID
const getFoodOrderById = async (req, res) => {
  const { food_order_id } = req.params;

  try {
    // Step 1: Fetch the specific food order along with staff username
    const { data: foodOrder, error: foodOrderError } = await supabase
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
      .eq('food_order_id', food_order_id)
      .single(); // Get single record

    if (foodOrderError) {
      console.error('Error retrieving food order:', foodOrderError.message);
      return res.status(400).json({ error: foodOrderError.message });
    }

    // Step 2: Fetch food order list items for the specific food order
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
      .eq('food_order_id', food_order_id);

    if (foodOrderListError) {
      console.error('Error retrieving food order list:', foodOrderListError.message);
      return res.status(400).json({ error: foodOrderListError.message });
    }

    // Step 3: Fetch check-in, room reservation, guest, and room details for the order
    let guestInfo = null;
    let roomInfo = null;

    if (foodOrder.check_in_id) {
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
        .eq('check_in_id', foodOrder.check_in_id)
        .single();

      if (checkInError) {
        console.error('Error retrieving check-in data:', checkInError.message);
        return res.status(400).json({ error: checkInError.message });
      }

      guestInfo = checkInData;

      // Fetch room details
      const { data: roomData, error: roomError } = await supabase
        .from('ROOM_LIST')
        .select(`
          room_reservation_id,
          ROOM (
            room_number,
            room_type_name
          )
        `)
        .eq('room_reservation_id', checkInData.room_reservation_id)
        .single();

      if (roomError) {
        console.error('Error retrieving room data:', roomError.message);
        return res.status(400).json({ error: roomError.message });
      }

      roomInfo = roomData;
    }

    // Step 4: Combine all data into a single response
    const combinedOrder = {
      ...foodOrder,
      staff_username: foodOrder.STAFF?.staff_username || 'Unknown', // Include staff username or default to 'Unknown'
      foodItems: foodOrderList.map(item => ({
        ...item,
        food_name: item.FOOD_ITEM?.food_name || 'Unknown' // Include food name or default to 'Unknown'
      })),
      guest_fname: guestInfo?.ROOM_RESERVATION?.GUEST?.guest_fname || 'N/A',
      guest_lname: guestInfo?.ROOM_RESERVATION?.GUEST?.guest_lname || 'N/A',
      room_number: roomInfo?.ROOM?.room_number || 'N/A',
      room_type_name: roomInfo?.ROOM?.room_type_name || 'N/A'
    };

    // Step 5: Send the combined data as a response
    res.status(200).json(combinedOrder);
  } catch (err) {
    console.error('Error fetching food order by ID:', err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getFoodOrderById };
