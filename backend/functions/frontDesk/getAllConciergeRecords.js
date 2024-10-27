const { supabase } = require('../../supabaseClient');

const getAllConciergeRecords = async (req, res) => {
  try {
    const { data: conciergeData, error: conciergeError } = await supabase
      .from('CONCIERGE')
      .select(`
        check_in_id,
        av_concierge_id,
        av_concierge_notes,
        av_concierge_total_price,
        av_concierge_status,
        CHECK_IN (
          room_reservation_id
        )
      `).in('av_concierge_status', ['COMPLETE', 'CANCELED']);

    if (conciergeError) {
      console.error('Error fetching concierge data:', conciergeError);
      return res.status(500).json({ error: conciergeError.message });
    }

    // Step 2: Fetch related concierge items from CONCIERGE_LIST using av_concierge_id
    const conciergeIds = conciergeData.map(item => item.av_concierge_id);
    const { data: conciergeListData, error: conciergeListError } = await supabase
      .from('CONCIERGE_LIST')
      .select(`
        av_concierge_id,
        concierge_list_id,
        concierge_id,
        concierge_quantity,
        concierge_subtotal,
        CONCIERGE_DETAIL (
          concierge_type,
          concierge_supplier
        )
      `)
      .in('av_concierge_id', conciergeIds);

    if (conciergeListError) {
      console.error('Error fetching concierge list data:', conciergeListError);
      return res.status(500).json({ error: conciergeListError.message });
    }

    // Step 3: Fetch room details from ROOM_LIST and ROOM
    const roomReservationIds = conciergeData.map(item => item.CHECK_IN?.room_reservation_id).filter(Boolean);

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

    // Step 4: Fetch guest details from ROOM_RESERVATION and GUEST
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

    // Step 5: Combine all data into a final structure
    const combinedData = conciergeData.map(concierge => {
      const roomInfo = roomData.find(r => r.room_reservation_id === concierge.CHECK_IN?.room_reservation_id);
      const guestInfo = guestData.find(g => g.room_reservation_id === concierge.CHECK_IN?.room_reservation_id);

      // Structure concierge items
      const conciergeItems = conciergeListData
        .filter(item => item.av_concierge_id === concierge.av_concierge_id)
        .map(item => ({
          concierge_list_id: item.concierge_list_id,
          concierge_type: item.CONCIERGE_DETAIL?.concierge_type || 'N/A',
          concierge_supplier: item.CONCIERGE_DETAIL?.concierge_supplier || 'N/A',
          concierge_quantity: item.concierge_quantity,
          concierge_subtotal: item.concierge_subtotal
        }));

      return {
        av_concierge_id:concierge.av_concierge_id,
        check_in_id: concierge.check_in_id,
        av_concierge_total_price: concierge.av_concierge_total_price,
        av_concierge_notes: concierge.av_concierge_notes,
        av_concierge_status: concierge.av_concierge_status,
        room_number: roomInfo?.ROOM?.room_number || 'N/A',
        guest_name: guestInfo ? `${guestInfo.GUEST?.guest_fname} ${guestInfo.GUEST?.guest_lname}` : 'N/A',
        concierge_items: conciergeItems
      };
    });

    // Send the final combined data as response
    res.status(200).json(combinedData);
  } catch (error) {
    console.error('Error fetching all concierge records:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getAllConciergeRecords };
