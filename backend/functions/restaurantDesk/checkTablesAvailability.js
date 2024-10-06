const { supabase } = require('../../supabaseClient');

// Function to get available tables based on the provided parameters
const checkTablesAvailability = async (req, res) => {
  const { table_reservation_date, table_time, table_guest_quantity } = req.query;

  try {
    // Step 1: Fetch all confirmed reservations for the given date, time, and guest quantity
    const { data: reservations, error: reservationsError } = await supabase
      .from('TABLE_RESERVATION')
      .select(`table_reservation_id, reservation_status`)
      .eq('table_reservation_date', table_reservation_date)
      .eq('table_time', table_time)
      .eq('reservation_status', 'PENDING');

    if (reservationsError) {
      console.error('Error retrieving reservations:', reservationsError.message);
      return res.status(400).json({ error: reservationsError.message });
    }

    // Step 2: Extract reserved table_reservation_ids
    const reservedTableReservationIds = reservations.map(reservation => reservation.table_reservation_id);

    // Step 3: Fetch table_id from TABLE_LIST using table_reservation_id
    const { data: reservedTableList, error: reservedTableListError } = await supabase
      .from('TABLE_LIST')
      .select(`table_id`)
      .in('table_reservation_id', reservedTableReservationIds);

    if (reservedTableListError) {
      console.error('Error retrieving reserved table list:', reservedTableListError.message);
      return res.status(400).json({ error: reservedTableListError.message });
    }

    // Step 4: Extract reserved table_ids
    const reservedTableIds = reservedTableList.map(reservation => reservation.table_id);

    // Step 5: Fetch all tables that match the guest quantity
    const { data: allTables, error: allTablesError } = await supabase
      .from('TABLE')
      .select('*')
      .gte('seat_quantity', table_guest_quantity);

    if (allTablesError) {
      console.error('Error retrieving all tables:', allTablesError.message);
      return res.status(400).json({ error: allTablesError.message });
    }

    const availableTables = allTables.map(table => {
      if (reservedTableIds.includes(table.table_id)) {
        return { ...table, status: 'PENDING' };
      } else {
        return { ...table, status: 'AVAILABLE' }; 
      }
    });

    // Step 7: Send the list of tables with their statuses in the response
    res.json(availableTables);
  } catch (error) {
    console.error('Error fetching table availability:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  checkTablesAvailability,
};
