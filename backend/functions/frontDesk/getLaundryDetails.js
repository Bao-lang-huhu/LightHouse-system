const { supabase } = require('../../supabaseClient');

const getLaundryDetails = async (req, res) => {
  const { check_in_id } = req.query;

  try {
    // Fetch the main laundry details
    const { data: laundryData, error: laundryError } = await supabase
      .from('LAUNDRY')
      .select(`
        av_laundry_id,
        check_in_id,
        staff_id,
        laun_notes,
        laun_kilo,
        laun_total_price,
        laun_status,
        laun_start_date,
        laun_end_date,
        laun_ironing,
        laun_is_outsourced
      `)
      .eq('check_in_id', check_in_id)
      .single();

    if (laundryError) {
      console.error('Error fetching laundry details:', laundryError);
      return res.status(500).json({ error: laundryError.message });
    }

    // Fetch guest and room details associated with this check-in
    const { data: checkInData, error: checkInError } = await supabase
      .from('CHECK_IN')
      .select(`
        check_in_id,
        ROOM_RESERVATION (
          guest_id,
          GUEST (
            guest_fname,
            guest_lname
          ),
          ROOM_LIST (
            ROOM (
              room_number
            )
          )
        )
      `)
      .eq('check_in_id', check_in_id)
      .single();

    if (checkInError) {
      console.error('Error fetching check-in data:', checkInError);
      return res.status(500).json({ error: checkInError.message });
    }

    // Safely access guest details and room number
    const guestDetails = checkInData?.ROOM_RESERVATION?.GUEST || { guest_fname: 'N/A', guest_lname: 'N/A' };
    const roomNumber = checkInData?.ROOM_RESERVATION?.ROOM_LIST?.ROOM?.room_number || 'N/A';

    // Fetch outsourced details if applicable
    let outsourcedData = null;
    if (laundryData.laun_is_outsourced) {
      const { data: outData, error: outsourcedError } = await supabase
        .from('OUTSOURCED_LAUNDRY')
        .select(`
          laun_outsource_name,
          laun_posted_by,
          laun_date_posted,
          laun_delivered_by,
          laun_date_delivered
        `)
        .eq('av_laundry_id', laundryData.av_laundry_id)
        .single();

      if (outsourcedError) {
        console.error('Error fetching outsourced laundry data:', outsourcedError);
      } else {
        outsourcedData = outData;
      }
    }

    // Fetch laundry item details in LAUNDRY_LIST and join with LAUNDRY_DETAIL
    const { data: laundryItems, error: laundryItemsError } = await supabase
      .from('LAUNDRY_LIST')
      .select(`
        laundry_id,
        laun_quantity,
        laun_subtotal,
        LAUNDRY_DETAIL (
          laundry_item,
          laundry_ironing_price
        )
      `)
      .eq('av_laundry_id', laundryData.av_laundry_id);

    if (laundryItemsError) {
      console.error('Error fetching laundry item data:', laundryItemsError);
      return res.status(500).json({ error: laundryItemsError.message });
    }

    // Format laundry items to include the LAUNDRY_DETAIL information
    const formattedLaundryItems = laundryItems.map(item => ({
      laundry_id: item.laundry_id,
      laun_quantity: item.laun_quantity,
      laun_subtotal: item.laun_subtotal,
      laundry_item: item.LAUNDRY_DETAIL?.laundry_item || 'N/A',
      laundry_ironing_price: item.LAUNDRY_DETAIL?.laundry_ironing_price || 0
    }));

    res.status(200).json({
      laundryData,
      guestData: guestDetails,
      roomNumber,
      outsourcedData,
      laundryItems: formattedLaundryItems,
    });
  } catch (err) {
    console.error('Error fetching laundry details:', err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getLaundryDetails };
