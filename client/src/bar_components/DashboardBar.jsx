import React, { useState, useEffect } from 'react'; 
import 'bulma/css/bulma.min.css';
import 'react-calendar/dist/Calendar.css'; // Import the default styles for the calendar
import '../App.css';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode
import Avatar from '@mui/material/Avatar';
import { ClipLoader } from 'react-spinners';

const DashboardBar = () => {
  const [staffName, setStaffName] = useState('Admin');
  const [allOrderCount, setAllOrderCount] = useState(0);
  const [drinkOrders, setDrinkOrders] = useState([]); // Replaced food orders with drink orders
  const [drinkList, setDrinkList] = useState([]); 
  const [loadingOrders, setLoadingOrders] = useState(false); // Loading state for drink orders
  const [loadingDrinkList, setLoadingDrinkList] = useState(false); // Loading state for drink list
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    // Update the date and time every second
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(timer);
  }, []);

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

    // Fetch incoming drink orders
    setLoadingOrders(true); // Start showing the loader
    axios.get('http://localhost:3001/api/getDrinkOrders') // Replace with actual API endpoint for drinks
      .then(response => setDrinkOrders(response.data))
      .catch(error => console.error('Error fetching incoming orders:', error))
      .finally(() => setLoadingOrders(false)); // Stop showing the loader

    // Fetch drink list with order count
    setLoadingDrinkList(true); // Start showing the loader
    axios.get('http://localhost:3001/api/getCountDrinkOrderList') // Replace with actual API endpoint for drinks
      .then(response => setDrinkList(response.data))
      .catch(error => console.error('Error fetching drink list:', error))
      .finally(() => setLoadingDrinkList(false)); // Stop showing the loader
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

          {/* Incoming Orders List */}
          <div className="box">
            <h2 className="subtitle is-5">Incoming Orders</h2>
            <div className="column">
              {loadingOrders ? (
                // Show ClipLoader while data is being fetched
                <div className="has-text-centered">
                  <ClipLoader color="blue" size={60} />
                </div>
              ) : drinkOrders.length === 0 ? (
                // Show this message when there are no orders
                <div className="has-text-centered has-text-grey-light m-0">
                  No incoming orders
                </div>
              ) : (
                drinkOrders.map((order) => (
                  <div key={order.bar_order_id} className="column m-0 p-1"> {/* Adjust column size as needed */}
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
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="column is-half">
          {/* Drink List with Order Count */}
          <div className="box">
            <h2 className="subtitle is-5">Drink Items with Order Count</h2>
            <div className="table-container">
              {loadingDrinkList ? (
                // Display ClipLoader while loading data
                <div className="has-text-centered">
                  <ClipLoader color="blue" size={50} />
                </div>
              ) : (
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
                          <Avatar
                            src={item.drink_photo || 'https://via.placeholder.com/64'}
                            alt={item.drink_name}
                            style={{
                              width: 32,
                              height: 32,
                              margin: 'auto',
                              objectFit: 'cover',
                              borderRadius: '8px'
                            }}
                            imgProps={{ style: { objectFit: 'cover' } }}
                          />
                        </td>
                        <td className="has-text-centered">{item.drink_name}</td>
                        <td className="has-text-centered has-text-weight-semibold">
                          {item.order_count} orders
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardBar;
