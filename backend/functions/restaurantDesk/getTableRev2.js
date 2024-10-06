const { supabase } = require('../../supabaseClient');

// Function to get table reservations and details for a specific date
const getTableReservations2 = async (req, res) => {
  const { table_reservation_date, table_time } = req.query;

  try {
    console.log(`Fetching reservations for date: ${table_reservation_date} and time: ${table_time}`);

    // Fetch all reservations for the given date and time
    const { data: reservations, error: reservationsError } = await supabase
      .from('TABLE_RESERVATION')
      .select('table_reservation_id, table_time, reservation_status, table_guest_quantity, guest_id')  // No table_id here
      .eq('table_reservation_date', table_reservation_date)
      .eq('table_time', table_time);

    if (reservationsError) {
      console.error('Error retrieving reservations:', reservationsError.message);
      return res.status(400).json({ error: reservationsError.message });
    }

    // Fetch all tables from the TABLE table
    const { data: allTables, error: allTablesError } = await supabase
      .from('TABLE')
      .select('*');

    if (allTablesError) {
      console.error('Error retrieving all tables:', allTablesError.message);
      return res.status(400).json({ error: allTablesError.message });
    }

    // Fetch table_id from TABLE_LIST or another related table using table_reservation_id
    const reservationIds = reservations.map(reservation => reservation.table_reservation_id);
    const { data: tableList, error: tableListError } = await supabase
      .from('TABLE_LIST')  // Assuming table_id exists in TABLE_LIST
      .select('table_id, table_reservation_id')
      .in('table_reservation_id', reservationIds);

    if (tableListError) {
      console.error('Error retrieving table list:', tableListError.message);
      return res.status(400).json({ error: tableListError.message });
    }

    // Mark the tables based on reservations
    const tablesWithStatus = allTables.map(table => {
     
        // Check if table is INACTIVE
        if (table.table_status === 'INACTIVE') {
          return {
            ...table,
            status: 'UNAVAILABLE',  // Mark table as unavailable if it is inactive
            reason: 'Table is not available at the moment' // Optional: you can add a reason
          };
        }
      const matchingTableList = tableList.find(tl => tl.table_id === table.table_id);
      if (matchingTableList) {
        const matchingReservation = reservations.find(res => res.table_reservation_id === matchingTableList.table_reservation_id);
        
        // If the reservation exists but has the status of 'CANCELED', mark the table as 'AVAILABLE'
        if (matchingReservation && matchingReservation.reservation_status === 'CANCELED') {
          return {
            ...table,
            status: 'AVAILABLE'  // Table is available if the reservation was canceled
          };
        }

        return {
          ...table,
          status: matchingReservation ? matchingReservation.reservation_status : 'AVAILABLE'
        };
      } else {
        return {
          ...table,
          status: 'AVAILABLE' // No reservation for this table, so it's available
        };
      }
    });

    res.status(200).json(tablesWithStatus);
  } catch (error) {
    console.error('Error fetching table reservations:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getTableReservations2,
};
