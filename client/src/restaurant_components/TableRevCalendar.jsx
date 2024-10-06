import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import '../App.css';
import '../manager_components/components_m.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const TableRevCalendar = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Function to map the backend times to your custom timeslots
  const mapToCustomTime = (tableTime) => {
    const timeMap = {
      '09:00:00': '09:00 AM',
      '10:00:00': '10:00 AM',
      '11:00:00': '11:00 AM',
      '02:00:00': '02:00 PM',
      '03:00:00': '03:00 PM',
      '04:00:00': '04:00 PM',
      '05:00:00': '05:00 PM',
    };

    return timeMap[tableTime] || '12:00 AM'; // Fallback to midnight if no match
  };

  // Function to fetch all table reservations from the backend
  const fetchReservations = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://light-house-system-h74t-server.vercel.app/api/getTableReservations3');

      // Format the reservations for the calendar
      const formattedReservations = response.data.map((reservation) => {
        const reservationDate = reservation.table_reservation_date || new Date().toISOString().slice(0, 10); // Use the reservation date, fallback to today

        // Handle null or missing table_time by assigning a default time
        const reservationTime = mapToCustomTime(reservation.table_time) || '12:00 AM'; // Use mapped time or default to 12:00 AM
        
        return {
          title: `Table ${reservation.table?.table_name || 'Unknown Table'} - ${reservation.guest.guest_fname} ${reservation.guest.guest_lname}`,
          start: new Date(`${reservationDate}T${reservation.table_time || '00:00:00'}`),  // Keep original time for calendar event creation
          end: new Date(`${reservationDate}T${reservation.table_time || '00:00:00'}`),    // Set the same time for start and end if there's no end time
          status: reservation.reservation_status,
          table: reservation.table?.table_name || 'Unknown Table',
          seats: reservation.table?.seat_quantity || 'Unknown',
          displayTime: reservationTime, // Mapped display time
        };
      });

      setReservations(formattedReservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations(); // Fetch reservations on component mount
  }, []);

  // Custom event style based on reservation status
  const eventStyleGetter = (event) => {
    let backgroundColor = '#3174ad'; // Default color
    if (event.status === 'COMPLETED') backgroundColor = '#28a745'; // Green for completed
    if (event.status === 'PENDING') backgroundColor = '#ffc107'; // Yellow for pending
    if (event.status === 'CANCELED') backgroundColor = '#dc3545'; // Red for canceled
    if (event.status === 'NO SHOW') backgroundColor = 'grey'; // Orange for no show

    return {
      style: {
        backgroundColor,
        color: 'white',
        borderRadius: '5px',
        padding: '5px',
      },
    };
  };

  return (
    <section className="section-p1">
      <div className="container">
        <h2 className="subtitle">Table Reservations Calendar</h2>
        <Link to="/restaurant_table_reservations"><button className='button is-blue m-1'>Table View</button></Link>

        {loading ? (
          <p>Loading reservations...</p>
        ) : (
          <Calendar
            localizer={localizer}
            events={reservations} // Use all reservations
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            eventPropGetter={eventStyleGetter} // Apply custom event styles
            components={{
              event: ({ event }) => (
                <span>
                  <strong>{event.title}</strong>
                  <div>Seats: {event.seats}</div>
                  <div>Status: {event.status}</div>
                  <div>Time: {event.displayTime}</div> {/* Display mapped time */}
                </span>
              ),
            }}
          />
        )}
      </div>
    </section>
  );
};

export default TableRevCalendar;
