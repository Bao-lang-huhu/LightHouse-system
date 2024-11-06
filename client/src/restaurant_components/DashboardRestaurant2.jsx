import React, { useState, useEffect } from 'react'; 
import 'bulma/css/bulma.min.css';
import 'react-calendar/dist/Calendar.css';
import '../App.css';
import './components_r.css';
import axios from 'axios';
import Calendar from 'react-calendar';
import { jwtDecode } from 'jwt-decode';

const DashboardRestaurant2 = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [staffName, setStaffName] = useState('Admin');
  const [pendingReservations, setPendingReservations] = useState([]);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const staffFullName = `${decoded.staff_fname} ${decoded.staff_lname}`;
        setStaffName(staffFullName);
      } catch (error) {
        console.error('Error decoding token:', error);
        setStaffName('Staff'); 
      }
    } else {
      setStaffName('Staff'); 
    }

    axios.get('https://light-house-system-h74t-server.vercel.app/api/getPendingTableReservations')
      .then(response => {
        setPendingReservations(response.data);
      })
      .catch(error => console.error('Error fetching pending reservations:', error));
  }, []);

  return (
    <section className='section-p1'>
      <div className="columns is-variable is-6">
        {/* Left Column */}
        <div className="column is-half">
          <div className="notification is-white">
            <h1 className="title is-4">Hello, {staffName}!</h1>
            <p className="subtitle">Welcome to the Restaurant Reception Desk Dashboard. (Table Management)</p>
          </div>

          {/* Pending Reservations List */}
          <div className="box">
            <h2 className="subtitle is-5">Pending Reservations</h2>
            <div 
              className="pending-reservations" 
              style={{
                maxHeight: 'calc(100vh - 300px)', // Limit height for small screens
                overflowY: 'auto' // Enable scrolling if content overflows
              }}
            >
              {pendingReservations.length === 0 ? (
                <p>No pending reservations.</p>
              ) : (
                pendingReservations.map((reservation) => (
                  <div key={reservation.table_reservation_id} className="column m-0 p-1" >
                    <div className="box">
                      <p><strong>Guest:</strong> {reservation.guest.guest_fname} {reservation.guest.guest_lname}</p>
                      <p><strong>Table:</strong> {reservation.table.table_name} (Seats: {reservation.table.seat_quantity})</p>
                      <p><strong>Status:</strong> {reservation.reservation_status}</p>
                      <p><strong>Date:</strong> {reservation.table_reservation_date}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="column is-half">
          <div className="box has-text-centered">
            <h2 className="subtitle is-5">{formatDateTime(currentDateTime)}</h2>
            <Calendar
              onChange={setCurrentDate}
              value={currentDate}
              className="is-centered"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardRestaurant2;
