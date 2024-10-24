const { supabase } = require('../../supabaseClient');

// Function to get a specific drink order by ID
const getDrinkOrderById = async (req, res) => {
  const { bar_order_id } = req.params;

  try {
    // Step 1: Fetch the specific drink order along with staff username
    const { data: drinkOrder, error: drinkOrderError } = await supabase
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
      `)
      .eq('bar_order_id', bar_order_id)
      .single(); // Get single record

    if (drinkOrderError) {
      console.error('Error retrieving drink order:', drinkOrderError.message);
      return res.status(400).json({ error: drinkOrderError.message });
    }

    // Step 2: Fetch drink order list items for the specific drink order
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
      .eq('bar_order_id', bar_order_id);

    if (drinkOrderListError) {
      console.error('Error retrieving drink order list:', drinkOrderListError.message);
      return res.status(400).json({ error: drinkOrderListError.message });
    }

    // Step 3: Fetch check-in, room reservation, guest, and room details for the order
    let guestInfo = null;
    let roomInfo = null;

    if (drinkOrder.check_in_id) {
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
        .eq('check_in_id', drinkOrder.check_in_id)
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
      ...drinkOrder,
      staff_username: drinkOrder.STAFF?.staff_username || 'Unknown', // Include staff username or default to 'Unknown'
      drinkItems: drinkOrderList.map(item => ({
        ...item,
        drink_name: item.BAR_DRINK?.drink_name || 'Unknown' // Include drink name or default to 'Unknown'
      })),
      guest_fname: guestInfo?.ROOM_RESERVATION?.GUEST?.guest_fname || 'N/A',
      guest_lname: guestInfo?.ROOM_RESERVATION?.GUEST?.guest_lname || 'N/A',
      room_number: roomInfo?.ROOM?.room_number || 'N/A',
      room_type_name: roomInfo?.ROOM?.room_type_name || 'N/A'
    };

    // Step 5: Send the combined data as a response
    res.status(200).json(combinedOrder);
  } catch (err) {
    console.error('Error fetching drink order by ID:', err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getDrinkOrderById };
