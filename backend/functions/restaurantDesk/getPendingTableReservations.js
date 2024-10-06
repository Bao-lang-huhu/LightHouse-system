const { supabase } = require('../../supabaseClient');

const getPendingTableReservations = async (req, res) => {
  try {
    console.log('Fetching all pending reservations');

    const { data: reservations, error: reservationsError } = await supabase
      .from('TABLE_RESERVATION')
      .select('table_reservation_id, guest_id, reservation_status, table_reservation_date')
      .eq('reservation_status', 'PENDING'); // Only fetch 'PENDING' reservations

    if (reservationsError) {
      console.error('Error retrieving reservations:', reservationsError.message);
      return res.status(400).json({ error: reservationsError.message });
    }

    if (reservations.length === 0) {
      console.log('No pending reservations found.');
      return res.status(200).json([]); // Return empty array if no pending reservations
    }

    // Step 2: Extract guest IDs and reservation IDs from the reservations
    const guestIds = reservations.map(reservation => reservation.guest_id);
    const reservationIds = reservations.map(reservation => reservation.table_reservation_id);

    // Step 3: Fetch guest details from GUEST table using guest_id
    const { data: guestDetails, error: guestDetailsError } = await supabase
      .from('GUEST')
      .select('guest_id, guest_fname, guest_lname')
      .in('guest_id', guestIds); // Fetch only the relevant guests

    if (guestDetailsError) {
      console.error('Error retrieving guest details:', guestDetailsError.message);
      return res.status(400).json({ error: guestDetailsError.message });
    }

    // Step 4: Fetch table_reservation_id and table_id from TABLE_LIST
    const { data: tableList, error: tableListError } = await supabase
      .from('TABLE_LIST')
      .select('table_reservation_id, table_id')
      .in('table_reservation_id', reservationIds); // Fetch only the relevant table reservations

    if (tableListError) {
      console.error('Error retrieving table list:', tableListError.message);
      return res.status(400).json({ error: tableListError.message });
    }

    // Step 5: Extract table IDs
    const tableIds = tableList.map(item => item.table_id);

    // Step 6: Fetch table details from TABLE using table_id
    const { data: tableDetails, error: tableDetailsError } = await supabase
      .from('TABLE')
      .select('table_id, table_name, seat_quantity')
      .in('table_id', tableIds); // Fetch only the relevant tables

    if (tableDetailsError) {
      console.error('Error retrieving table details:', tableDetailsError.message);
      return res.status(400).json({ error: tableDetailsError.message });
    }

    // Step 7: Combine reservations with guest and table details
    const combinedReservations = reservations.map(reservation => {
      const matchingTableList = tableList.find(tl => tl.table_reservation_id === reservation.table_reservation_id);
      const matchingTableDetails = tableDetails.find(td => td.table_id === matchingTableList?.table_id);
      const matchingGuestDetails = guestDetails.find(guest => guest.guest_id === reservation.guest_id);

      return {
        ...reservation,
        guest: {
          guest_fname: matchingGuestDetails?.guest_fname || 'Unknown',
          guest_lname: matchingGuestDetails?.guest_lname || 'Unknown',
        },
        table: {
          table_name: matchingTableDetails?.table_name || 'Unknown',
          seat_quantity: matchingTableDetails?.seat_quantity || 'Unknown',
        }
      };
    });

    // Step 8: Send the combined data as the response
    res.status(200).json(combinedReservations);
  } catch (error) {
    console.error('Error fetching pending table reservations:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getPendingTableReservations,
};
