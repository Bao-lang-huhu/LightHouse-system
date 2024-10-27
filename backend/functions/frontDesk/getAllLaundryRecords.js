const { supabase } = require('../../supabaseClient');

const getAllLaundryRecords = async (req, res) => {
  try {
    // Fetch main laundry records
    const { data: laundryData, error: laundryError } = await supabase
      .from('LAUNDRY')
      .select(`
        av_laundry_id,
        check_in_id,
        laun_notes,
        laun_kilo,
        laun_total_price,
        laun_status,
        laun_start_date,
        laun_end_date,
        laun_ironing,
        laun_is_outsourced,
        CHECK_IN (
          room_reservation_id
        )
      `)
      .in('laun_status', ['COMPLETE', 'CANCELED']);

    if (laundryError) {
      console.error('Error fetching laundry data:', laundryError);
      return res.status(500).json({ error: laundryError.message });
    }

    // Fetch related laundry items from LAUNDRY_LIST
    const laundryIds = laundryData.map(item => item.av_laundry_id);
    const { data: laundryListData, error: laundryListError } = await supabase
      .from('LAUNDRY_LIST')
      .select(`
        av_laundry_id,
        laundry_list_id,
        laundry_id,
        laun_quantity,
        laun_subtotal,
        LAUNDRY_DETAIL (
          laundry_item,
          laundry_ironing_price
        )
      `)
      .in('av_laundry_id', laundryIds);
      

    if (laundryListError) {
      console.error('Error fetching laundry list data:', laundryListError);
      return res.status(500).json({ error: laundryListError.message });
    }

    // Fetch room details from ROOM_LIST and ROOM
    const roomReservationIds = laundryData.map(item => item.CHECK_IN?.room_reservation_id).filter(Boolean);
    const { data: roomData, error: roomError } = await supabase
      .from('ROOM_LIST')
      .select(`
        room_reservation_id,
        ROOM (
          room_number
        )
      `)
      .in('room_reservation_id', roomReservationIds);

    if (roomError) {
      console.error('Error fetching room data:', roomError);
      return res.status(500).json({ error: roomError.message });
    }

    // Fetch guest details from ROOM_RESERVATION and GUEST
    const { data: guestData, error: guestError } = await supabase
      .from('ROOM_RESERVATION')
      .select(`
        room_reservation_id,
        guest_id,
        GUEST (
          guest_fname,
          guest_lname
        )
      `)
      .in('room_reservation_id', roomReservationIds);

    if (guestError) {
      console.error('Error fetching guest data:', guestError);
      return res.status(500).json({ error: guestError.message });
    }

    // Fetch outsourced laundry details if laundry is outsourced
    const { data: outsourcedData, error: outsourcedError } = await supabase
      .from('OUTSOURCED_LAUNDRY')
      .select(`
        av_laundry_id,
        laun_outsource_name,
        laun_posted_by,
        laun_date_posted,
        laun_delivered_by,
        laun_date_delivered
      `)
      .in('av_laundry_id', laundryIds);

    if (outsourcedError) {
      console.error('Error fetching outsourced laundry data:', outsourcedError);
      return res.status(500).json({ error: outsourcedError.message });
    }

    // Combine all data
    const combinedData = laundryData.map(laundry => {
      const roomInfo = roomData.find(r => r.room_reservation_id === laundry.CHECK_IN?.room_reservation_id);
      const guestInfo = guestData.find(g => g.room_reservation_id === laundry.CHECK_IN?.room_reservation_id);

      // Structure laundry items
      const laundryItems = laundryListData
        .filter(item => item.av_laundry_id === laundry.av_laundry_id)
        .map(item => ({
          laundry_list_id: item.laundry_list_id,
          laundry_item: item.LAUNDRY_DETAIL?.laundry_item || 'N/A',
          ironing_price: item.LAUNDRY_DETAIL?.laundry_ironing_price || 0,
          quantity: item.laun_quantity,
          subtotal: item.laun_subtotal,
        }));

      // Get outsourced data if available
      const outsourcedInfo = outsourcedData.find(out => out.av_laundry_id === laundry.av_laundry_id) || null;

      return {
        av_laundry_id: laundry.av_laundry_id,
        check_in_id: laundry.check_in_id,
        laun_notes: laundry.laun_notes,
        laun_kilo: laundry.laun_kilo,
        laun_total_price: laundry.laun_total_price,
        laun_status: laundry.laun_status,
        laun_start_date: laundry.laun_start_date,
        laun_end_date: laundry.laun_end_date,
        laun_ironing: laundry.laun_ironing,
        laun_is_outsourced: laundry.laun_is_outsourced,
        room_number: roomInfo?.ROOM?.room_number || 'N/A',
        guest_name: guestInfo ? `${guestInfo.GUEST?.guest_fname} ${guestInfo.GUEST?.guest_lname}` : 'N/A',
        laundry_items: laundryItems,
        outsourced_details: outsourcedInfo
          ? {
              laun_outsource_name: outsourcedInfo.laun_outsource_name,
              laun_posted_by: outsourcedInfo.laun_posted_by,
              laun_date_posted: outsourcedInfo.laun_date_posted,
              laun_delivered_by: outsourcedInfo.laun_delivered_by,
              laun_date_delivered: outsourcedInfo.laun_date_delivered,
            }
          : null,
      };
    });

    res.status(200).json(combinedData);
  } catch (error) {
    console.error('Error fetching all laundry records:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getAllLaundryRecords };
