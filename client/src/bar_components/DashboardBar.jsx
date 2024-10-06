import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import 'react-calendar/dist/Calendar.css'; // Import the default styles for the calendar
import '../App.css';
import { IoPerson, IoClipboard, IoWineOutline, IoBarbellOutline } from 'react-icons/io5'; // Replaced food-related icons with bar icons
import axios from 'axios';
import Calendar from 'react-calendar'; // Import the Calendar component
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode

const DashboardBar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [staffName, setStaffName] = useState('Admin');
  const [guestCount, setGuestCount] = useState(0);
  const [drinkItemCount, setDrinkItemCount] = useState(0); // Replaced food count with drink count
  const [incomingOrderCount, setIncomingOrderCount] = useState(0);
  const [allOrderCount, setAllOrderCount] = useState(0);
  const [drinkOrders, setDrinkOrders] = useState([]); // Replaced food orders with drink orders
  const [drinkList, setDrinkList] = useState([]); // Replaced food list with drink list
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
    // Fetch current staff data from JWT token
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

    // Fetch data for the four boxes (replace with actual API calls)
    setGuestCount(120); // Replace with actual data
    setDrinkItemCount(85); // Replace with actual data
    setIncomingOrderCount(35); // Replace with actual data
    setAllOrderCount(220); // Replace with actual data

    // Fetch incoming drink orders
    axios.get('https://light-house-system.vercel.app/api/getDrinkOrders') // Replace with actual API endpoint for drinks
      .then(response => setDrinkOrders(response.data))
      .catch(error => console.error('Error fetching incoming orders:', error));

    // Fetch drink list with order count
    axios.get('https://light-house-system.vercel.app/api/getCountDrinkOrderList') // Replace with actual API endpoint for drinks
      .then(response => setDrinkList(response.data))
      .catch(error => console.error('Error fetching drink list:', error));
  }, []);

  return (
    <section className='section-p1'>
      <div className="columns is-variable is-6">
        {/* Left Column */}
        <div className="column is-half">
          {/* Welcome Section */}
          <div className="notification is-white">
            <h1 className="title is-4">Hello, {staffName}!</h1>
            <p className="subtitle">Welcome to the Bar Dashboard.</p>
          </div>

          {/* Four Boxes Section */}
          <div className="columns is-multiline">
            <div className="column is-6">
              <div className="box is-flex is-flex-direction-row is-flex-direction-column-mobile" style={{ padding: '1rem' }}>
                <div className="is-flex is-justify-content-center is-align-items-center" style={{ flex: '1 1 50%', overflow: 'hidden' }}>
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
                <div className="is-flex is-justify-content-center is-align-items-center" style={{ flex: '1 1 50%', overflow: 'hidden' }}>
                  <span>
                    <IoWineOutline size={40} className="is-violet" /> {/* Icon for drinks */}
                  </span>
                </div>
                <div className="ml-3" style={{ flex: '1 1 50%', overflow: 'hidden', textAlign: 'center' }}>
                  <label className="has-text-weight-semibold">Drink Items</label>
                  <p className="is-size-5 has-text-primary">{drinkItemCount}</p>
                </div>
              </div>
            </div>

            <div className="column is-6">
              <div className="box is-flex is-flex-direction-row is-flex-direction-column-mobile" style={{ padding: '1rem' }}>
                <div className="is-flex is-justify-content-center is-align-items-center" style={{ flex: '1 1 50%', overflow: 'hidden' }}>
                  <span>
                    <IoClipboard size={40} className="is-violet" />
                  </span>
                </div>
                <div className="ml-3" style={{ flex: '1 1 50%', overflow: 'hidden', textAlign: 'center' }}>
                  <label className="has-text-weight-semibold">Incoming Orders</label>
                  <p className="is-size-5 has-text-primary">{incomingOrderCount}</p>
                </div>
              </div>
            </div>

            <div className="column is-6">
              <div className="box is-flex is-flex-direction-row is-flex-direction-column-mobile" style={{ padding: '1rem' }}>
                <div className="is-flex is-justify-content-center is-align-items-center" style={{ flex: '1 1 50%', overflow: 'hidden' }}>
                  <span>
                    <IoBarbellOutline size={40} className="is-violet" /> {/* Another relevant bar-related icon */}
                  </span>
                </div>
                <div className="ml-3" style={{ flex: '1 1 50%', overflow: 'hidden', textAlign: 'center' }}>
                  <label className="has-text-weight-semibold">All Orders</label>
                  <p className="is-size-5 has-text-primary">{allOrderCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Incoming Orders List */}
          <div className="box">
            <h2 className="subtitle is-5">Incoming Orders</h2>
            <div className="column">
              {drinkOrders.map((order) => (
                <div key={order.bar_order_id} className="column"> {/* Adjust column size as needed */}
                  <div className="box">
                    {/* Order ID */}
                    <h3 className="subtitle is-6 has-text-centered">
                      Order ID: {order.bar_order_id}
                    </h3>

                    {/* List of Drink Items and Quantities */}
                    <div className="content">
                      {order.drinkItems.map((item) => (
                        <div key={item.bar_order_list_id} className="is-flex is-justify-content-space-between is-align-items-center" style={{ borderBottom: '1px solid #eaeaea', padding: '8px 0' }}>
                          <div className="has-text-weight-semibold">{item.drink_name}</div>
                          <div>{item.b_order_qty} x</div>
                          <div>₱{item.b_order_subtotal.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
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

          {/* Drink List with Order Count */}
          <div className="box">
            <h2 className="subtitle is-5">Drink Items with Order Count</h2>
            <div className="table-container">
              <table className="table is-fullwidth is-striped is-hoverable">
                <thead>
                  <tr>
                    <th className="has-text-centered">Drink Image</th>
                    <th className="has-text-centered">Drink Name</th>
                    <th className="has-text-centered">Order Count</th>
                  </tr>
                </thead>
                <tbody>
                  {drinkList.map((item) => (
                    <tr key={item.drink_id}>
                      <td className="has-text-centered">
                        <figure className="image is-64x64" style={{ margin: 'auto' }}>
                          <img
                            src={item.drink_photo || 'https://via.placeholder.com/64'}
                            alt={item.drink_name}
                            style={{ objectFit: 'cover', borderRadius: '8px' }}
                          />
                        </figure>
                      </td>
                      <td className="has-text-centered">{item.drink_name}</td>
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

export default DashboardBar;
