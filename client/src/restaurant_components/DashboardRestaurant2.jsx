import React, { useState, useEffect } from 'react'; 
import 'bulma/css/bulma.min.css';
import 'react-calendar/dist/Calendar.css'; // Import the default styles for the calendar
import '../App.css';
import './components_r.css';
import { IoPerson, IoClipboard, IoFastFoodOutline, IoRestaurant } from 'react-icons/io5';
import axios from 'axios';
import Calendar from 'react-calendar'; // Import the Calendar component
import {jwtDecode} from 'jwt-decode'; // Import jwtDecode

const DashboardRestaurant2 = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [staffName, setStaffName] = useState('Admin');
  const [guestCount, setGuestCount] = useState(0);
  const [foodItemCount, setFoodItemCount] = useState(0);
  const [incomingOrderCount, setIncomingOrderCount] = useState(0);
  const [allOrderCount, setAllOrderCount] = useState(0);
  const [pendingReservations, setPendingReservations] = useState([]);
  const [foodList, setFoodList] = useState([]);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    // Update the date and time every second
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(timer);
  }, []);

  // Format the date and time
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
    const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const staffFullName = `${decoded.staff_fname} ${decoded.staff_lname}`;
        setStaffName(staffFullName); // Set the staff's full name
      } catch (error) {
        console.error('Error decoding token:', error);
        setStaffName('Staff'); 
      }
    } else {
      setStaffName('Staff'); 
    }

    // Fetch all pending table reservations with guest details
    axios.get('https://light-house-system.vercel.app/api/getPendingTableReservations') // Adjust the endpoint to your backend setup
      .then(response => {
        setPendingReservations(response.data); // Set the fetched pending reservations
      })
      .catch(error => console.error('Error fetching pending reservations:', error));
    
    // Fetch food list with order count
    /*axios.get('http://localhost:3001/api/getCountFoodOrderList') // Adjust the endpoint as needed
      .then(response => setFoodList(response.data))
      .catch(error => console.error('Error fetching food list:', error));
  */}, []);

  return (
    <section className='section-p1'>
      <div className="columns is-variable is-6">
        {/* Left Column */}
        <div className="column is-half">
          {/* Welcome Section */}
          <div className="notification is-white">
            <h1 className="title is-4">Hello, {staffName}!</h1>
            <p className="subtitle">Welcome to the Restaurant Reception Desk Dashboard. (Table Management)</p>
          </div>

          {/* Four Boxes Section */}
          <div className="columns is-multiline">
            <div className="column is-6">
              <div className="box is-flex is-flex-direction-row is-flex-direction-column-mobile" style={{ padding: '1rem' }}>
                <div className="is-flex is-justify-content-center is-align-items-center" style={{ flex: '1 1 50%', overflow: 'hidden' }} >
                  <span>
                    <IoPerson size={40} className="is-violet" />
                  </span>
                </div>
                <div className="ml-3" style={{ flex: '1 1 50%', overflow: 'hidden', textAlign: 'center' }}>
                  <label className="has-text-weight-semibold">Guest</label>
                  <p className="is-size-5 has-text-primary">{guestCount}</p>
                </div>
              </div>
            </div>

            <div className="column is-6">
              <div className="box is-flex is-flex-direction-row is-flex-direction-column-mobile" style={{ padding: '1rem' }}>
                <div className="is-flex is-justify-content-center is-align-items-center" style={{ flex: '1 1 50%', overflow: 'hidden' }} >
                  <span>
                    <IoFastFoodOutline size={40} className="is-violet" />
                  </span>
                </div>
                <div className="ml-3" style={{ flex: '1 1 50%', overflow: 'hidden', textAlign: 'center' }}>
                  <label className="has-text-weight-semibold">Tables</label>
                  <p className="is-size-5 has-text-primary">{foodItemCount}</p>
                </div>
              </div>
            </div>

            <div className="column is-6">
              <div className="box is-flex is-flex-direction-row is-flex-direction-column-mobile" style={{ padding: '1rem' }}>
                <div className="is-flex is-justify-content-center is-align-items-center" style={{ flex: '1 1 50%', overflow: 'hidden' }} >
                  <span>
                    <IoClipboard size={40} className="is-violet" />
                  </span>
                </div>
                <div className="ml-3" style={{ flex: '1 1 50%', overflow: 'hidden', textAlign: 'center' }}>
                  <label className="has-text-weight-semibold">Incoming Reservations</label>
                  <p className="is-size-5 has-text-primary">{incomingOrderCount}</p>
                </div>
              </div>
            </div>

            <div className="column is-6">
              <div className="box is-flex is-flex-direction-row is-flex-direction-column-mobile" style={{ padding: '1rem' }}>
                <div className="is-flex is-justify-content-center is-align-items-center" style={{ flex: '1 1 50%', overflow: 'hidden' }}>
                  <span>
                    <IoRestaurant size={40} className="is-violet" />
                  </span>
                </div>
                <div className="ml-3" style={{ flex: '1 1 50%', overflow: 'hidden', textAlign: 'center' }}>
                  <label className="has-text-weight-semibold">Confirmed Reservations</label>
                  <p className="is-size-5 has-text-primary">{allOrderCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Reservations List */}
          <div className="box">
            <h2 className="subtitle is-5">Pending Reservations</h2>
            <div className="column">
              {pendingReservations.length === 0 ? (
                <p>No pending reservations.</p>
              ) : (
                pendingReservations.map((reservation) => (
                  <div key={reservation.table_reservation_id} className="column">
                    <div className="box">
                      <h3 className="subtitle is-6 has-text-centered">
                        Reservation ID: {reservation.table_reservation_id}
                      </h3>
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
          {/* Calendar Section */}
            <div className="box has-text-centered">
            <h2 className="subtitle is-5">{formatDateTime(currentDateTime)}</h2>
            <Calendar
              onChange={setCurrentDate}
              value={currentDate}
              className="is-centered"
            />
          </div>

          {/* Food List with Order Count */}
          <div className="box">
            <h2 className="subtitle is-5">Number of Reservations per Month</h2>
            <div className="table-container">
              <table className="table is-fullwidth is-striped is-hoverable">
                <thead>
                  <tr>
                    <th className="has-text-centered">Food Image</th>
                    <th className="has-text-centered">Food Name</th>
                    <th className="has-text-centered">Order Count</th>
                  </tr>
                </thead>
                <tbody>
                  {foodList.map((item) => (
                    <tr key={item.food_id}>
                      <td className="has-text-centered">
                        <figure className="image is-64x64" style={{ margin: 'auto' }}>
                          <img
                            src={item.food_photo || 'https://via.placeholder.com/64'}
                            alt={item.food_name}
                            style={{ objectFit: 'cover', borderRadius: '8px' }}
                          />
                        </figure>
                      </td>
                      <td className="has-text-centered">{item.food_name}</td>
                      <td className="has-text-centered has-text-weight-semibold">
                        {item.order_count} orders
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardRestaurant2;
