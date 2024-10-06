const { supabase } = require('../../supabaseClient');

const getAllTableReservations = async (req, res) => {
  try {
    console.log(`Fetching all reservations`);

    // Step 1: Fetch all reservations (no date filtering)
    const { data: reservations, error: reservationsError } = await supabase
      .from('TABLE_RESERVATION')
      .select('table_reservation_id, table_time, reservation_status, table_guest_quantity, guest_id, table_reservation_date'); // Include reservation date

    if (reservationsError) {
      console.error('Error retrieving reservations:', reservationsError.message);
      return res.status(400).json({ error: reservationsError.message });
    }

    if (reservations.length === 0) {
      console.log('No reservations found.');
      return res.status(200).json([]); 
    }

    // Log the reservations data fetched
    console.log('Reservations data:', reservations);

    const guestIds = reservations.map(reservation => reservation.guest_id);
    const reservationIds = reservations.map(reservation => reservation.table_reservation_id);

    const { data: guestDetails, error: guestDetailsError } = await supabase
      .from('GUEST')
      .select('guest_id, guest_fname, guest_lname, guest_phone_no')
      .in('guest_id', guestIds);

    if (guestDetailsError) {
      console.error('Error retrieving guest details:', guestDetailsError.message);
      return res.status(400).json({ error: guestDetailsError.message });
    }

    // Log guest details data
    console.log('Guest details data:', guestDetails);

    // Step 4: Fetch table_id from TABLE_LIST using table_reservation_id
    const { data: tableList, error: tableListError } = await supabase
      .from('TABLE_LIST')
      .select('table_id, table_reservation_id')
      .in('table_reservation_id', reservationIds);

    if (tableListError) {
      console.error('Error retrieving table list:', tableListError.message);
      return res.status(400).json({ error: tableListError.message });
    }

    // Log table list data
    console.log('Table list data:', tableList);

    // Step 5: Extract table IDs
    const tableIds = tableList.map(item => item.table_id);

    // Step 6: Fetch details from TABLE using the table_ids
    const { data: tableDetails, error: tableDetailsError } = await supabase
      .from('TABLE')
      .select('table_id, table_name, seat_quantity')
      .in('table_id', tableIds);

    if (tableDetailsError) {
      console.error('Error retrieving table details:', tableDetailsError.message);
      return res.status(400).json({ error: tableDetailsError.message });
    }

    // Log table details data
    console.log('Table details data:', tableDetails);

    // Step 7: Combine table reservations with table and guest details
    const combinedReservations = reservations.map(reservation => {
      const matchingTableList = tableList.find(tl => tl.table_reservation_id === reservation.table_reservation_id);
      const matchingTableDetails = tableDetails.find(td => td.table_id === matchingTableList?.table_id);
      const matchingGuestDetails = guestDetails.find(guest => guest.guest_id === reservation.guest_id);

      return {
        ...reservation,
        guest: {
          guest_fname: matchingGuestDetails?.guest_fname,
          guest_lname: matchingGuestDetails?.guest_lname,
          guest_phone_no: matchingGuestDetails?.guest_phone_no,
        },
        table: {
          table_id: matchingTableDetails?.table_id,
          table_name: matchingTableDetails?.table_name,
          seat_quantity: matchingTableDetails?.seat_quantity,
        }
      };
    });

    // Log combined reservations data
    console.log('Combined reservations data:', combinedReservations);

    // Step 8: Send the final response with combined reservation details
    res.status(200).json(combinedReservations);
  } catch (error) {
    console.error('Error fetching table reservations:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getAllTableReservations,
};
