import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import 'react-calendar/dist/Calendar.css'; 
import '../App.css';
import './components_r.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import Avatar from '@mui/material/Avatar';
import { ClipLoader } from 'react-spinners';


const DashboardRestaurant = () => {
  const [staffName, setStaffName] = useState('Admin');
  const [foodOrders, setFoodOrders] = useState([]);
  const [foodList, setFoodList] = useState([]);
  const [loading, setLoading] = useState(false);

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
    const fetchInitialData = async () => {
        setLoading(true); // Start showing the loader

        try {
            // Decode the token and set the staff name
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
            }

            // Fetch incoming food orders
            const foodOrdersResponse = await axios.get('http://localhost:3001/api/getFoodOrders'); // Replace with actual API endpoint
            setFoodOrders(foodOrdersResponse.data);

            // Fetch food list with order count
            const foodListResponse = await axios.get('http://localhost:3001/api/getCountFoodOrderList'); // Replace with actual API endpoint
            setFoodList(foodListResponse.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false); // Stop showing the loader
        }
    };

    fetchInitialData();
}, []);


  return (
    <section className='section-p1'>
      <div className="columns is-variable is-6">
        {/* Left Column */}
        <div className="column is-half">
          {/* Welcome Section */}
          <div className="notification is-white">
            <h1 className="title is-4">Hello, {staffName}!</h1>
            <p className="subtitle">Welcome to the Restaurant Reception Desk Dashboard.</p>
          </div>

          <div className="box">
            <h2 className="subtitle is-5">
              <Link to="/restaurant_incoming_orders" className='has-text-black'>Incoming Orders</Link>
            </h2>
            <div className="column m-0 p-0">
              {loading ? (
                // Show ClipLoader while data is being fetched
                <div className="has-text-centered">
                  <ClipLoader color="blue" size={60} />
                </div>
              ) : foodOrders.length === 0 ? (
                // Show this message when there are no orders
                <div className="has-text-centered has-text-grey-light m-0">
                  No incoming orders
                </div>
              ) : (
                // Render the list of incoming orders
                foodOrders.map((order) => (
                  <div key={order.food_order_id} className="column m-0 p-1">
                    <div className="box">
                      {/* Order ID */}
                      <h3 className="subtitle is-6 has-text-left">
                        Guest: {order.guest_fname && order.guest_lname ? `${order.guest_fname} ${order.guest_lname}` : 'Restaurant Guest'}
                      </h3>

                      {/* List of Food Items and Quantities */}
                      <div className="content">
                        {order.foodItems.map((item) => (
                          <div
                            key={item.food_order_list_id}
                            className="is-flex is-justify-content-space-between is-align-items-center"
                            style={{ borderBottom: '1px solid #eaeaea', padding: '8px 0' }}
                          >
                            <div className="has-text-weight-semibold">{item.food_name}</div>
                            <div>{item.f_order_qty} x</div>
                            <div>₱{item.f_order_subtotal.toFixed(2)}</div>
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
            {/* Food List with Order Count */}
            <div className="box">
                <h2 className="subtitle is-5">Food Items with Order Count</h2>
                <div className="table-container">
                    {loading ? (
                        // Display ClipLoader while loading data
                        <div className="has-text-centered">
                            <ClipLoader color="blue" size={50} />
                        </div>
                    ) : (
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
                                            <Avatar
                                                src={item.food_photo || 'https://via.placeholder.com/64'}
                                                alt={item.food_name}
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
                                        <td className="has-text-centered">{item.food_name}</td>
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

export default DashboardRestaurant;
