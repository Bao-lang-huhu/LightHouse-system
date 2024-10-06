import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import './components_r.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TextField } from '@mui/material';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; 
import ErrorMsg from '../messages/errorMsg'; 
import SuccessMsg from '../messages/successMsg'; 

const ProceedRestaurant = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [foodOrders, setFoodOrders] = useState([]);
  const [notes, setNotes] = useState(''); // Make notes editable
  const [total, setTotal] = useState(0);
  const [checkedInGuests, setCheckedInGuests] = useState([]);
  const [selectedCheckInId, setSelectedCheckInId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [currentStaff, setCurrentStaff] = useState({});
  const [orderSuccess, setOrderSuccess] = useState(''); // State for success message
  const [orderError, setOrderError] = useState(''); // State for error message

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentStaff({
          staff_id: decoded.staff_id,
          staff_name: `${decoded.staff_fname} ${decoded.staff_lname}`
        });
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchCheckedInGuests = async () => {
      try {
        const response = await axios.get('https://light-house-system.vercel.app/api/getCheckedInGuests');
        setCheckedInGuests(response.data);
      } catch (error) {
        console.error('Error fetching checked-in guests:', error);
      }
    };

    if (paymentMethod === 'ROOM') {
      fetchCheckedInGuests();
    }
  }, [paymentMethod]);

  useEffect(() => {
    const state = location.state || {};
    if (state.foodOrders && state.notes) {
      setFoodOrders(state.foodOrders);
      setNotes(state.notes);
      setTotal(state.total);
    } else {
      const savedOrders = JSON.parse(localStorage.getItem('foodOrders')) || [];
      const savedNotes = localStorage.getItem('notes') || '';
      setFoodOrders(savedOrders);
      setNotes(savedNotes);
      setTotal(savedOrders.reduce((sum, item) => sum + item.food_price * item.quantity, 0));
    }
  }, [location.state]);

  const handlePlaceOrder = async () => {
    try {
      const orderData = {
        staff_id: currentStaff.staff_id,
        check_in_id: selectedCheckInId,
        f_payment_method: paymentMethod,
        f_order_total: total,
        f_notes: notes, // Include notes in the order data
        foodItems: foodOrders
      };
  
      const response = await axios.post('https://light-house-system.vercel.app/api/registerFoodOrders', orderData);
  
      if (response.status === 201) {
        // Set success message and clear error message
        setOrderSuccess('Order placed successfully!');
        setOrderError('');
        
        // Remove food orders and notes from local storage after order is placed
        localStorage.removeItem('foodOrders');
        localStorage.removeItem('notes');
        
        // Redirect to the order list page
        navigate('/restaurant_incoming_orders');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      // Set error message and clear success message
      setOrderError('Failed to place order. Please try again.');
      setOrderSuccess('');
    }
  };

  const numberOfItems = foodOrders.length;

  return (
    <section className="section-p1">
      <div className='container-white-space'>
        <h1 className="subtitle">
          <strong>Print Order</strong>
        </h1>

        {/* Display success or error message */}
        {orderError && <ErrorMsg message={orderError} />}
        {orderSuccess && <SuccessMsg message={orderSuccess} />}

        <div className="columns">
          <div className="column is-6">
            <div className='field'>
              <label className='label'>Staff Information</label>
              <p><strong>Staff Name:</strong> {currentStaff.staff_name || 'Not Available'}</p>
            </div>
            
            <div className="field">
              <label className="label">Payment Method</label>
              <div className="control">
                <div className="select is-fullwidth">
                  <select
                    value={paymentMethod}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value);
                      if (e.target.value !== 'ROOM') {
                        setSelectedCheckInId('');
                      }
                    }}
                  >
                    <option value="">Select payment method</option>
                    <option value="CASH">Cash</option>
                    <option value="ROOM">Room</option>
                    <option value="CARD">Card</option>
                    <option value="E_WALLET">E-wallet</option>
                  </select>
                </div>
              </div>
            </div>

            {paymentMethod === 'ROOM' && (
              <div className="field">
                <label className="label">Charged To</label>
                <div className="control">
                  <div className="select is-fullwidth">
                    <select
                      value={selectedCheckInId}
                      onChange={(e) => setSelectedCheckInId(e.target.value)}
                    >
                      <option value="">Select guest</option>
                      {checkedInGuests.map((guest) => (
                        <option key={guest.check_in_id} value={guest.check_in_id}>
                          {guest.guest_fname} {guest.guest_lname} (Room {guest.room_number})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {paymentMethod === 'ROOM' && (
            <div className="column is-6">
              <div className="field">
                <label className="label">Room Number</label>
                <div className="control">
                  <input
                    className="input"
                    type="text"
                    placeholder="Room number"
                    readOnly
                    value={checkedInGuests.find(guest => guest.check_in_id === selectedCheckInId)?.room_number || ''}
                  />
                </div>
              </div>

              <div className="field">
                <label className="label">Room Type</label>
                <div className="control">
                  <input
                    className="input"
                    type="text"
                    placeholder="Room type"
                    readOnly
                    value={checkedInGuests.find(guest => guest.check_in_id === selectedCheckInId)?.room_type_name || ''}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className='container-blue-space'>
          <h1 className="subtitle">
            <strong>Total Order</strong>
          </h1>

          <div className='columns'>
            <div className='column is-8'>
              <div className="table-container">
                <table className="table is-fullwidth is-striped is-hoverable">
                  <thead>
                    <tr>
                      <th className="has-text-centered">Image</th>
                      <th className="has-text-centered">Food Name</th>
                      <th className="has-text-centered">Quantity</th>
                      <th className="has-text-centered">Subtotal</th>
                    </tr>
                  </thead>

                  <tbody>
                    {foodOrders.map((item) => (
                      <tr key={item.food_id}>
                        <td>
                          <figure className="image is-64x64">
                            <img src={item.food_photo} alt={item.food_name} />
                          </figure>
                        </td>
                        <td>{item.food_name}</td>
                        <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                          <TextField
                            type="number"
                            value={item.quantity}
                            InputProps={{
                              readOnly: true,
                              style: { textAlign: 'center', width: '60px' }
                            }}
                          />
                        </td>
                        <td>₱{(item.food_price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Link to="/restaurant_order">
                <button className="button is-blue"> Back</button>
              </Link>
            </div>

            <div className='column is-4'>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p className='title is-6'>Number of Items: {numberOfItems}</p>
                  <p className='title is-6'>Total: ₱{total.toFixed(2)}</p>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <textarea
                  value={notes} // Make textarea editable
                  onChange={(e) => setNotes(e.target.value)} // Update notes state on change
                  placeholder="Enter your notes here..."
                  className='textarea'
                  style={{ width: '100%', minHeight: '100px' }}
                />
              </div>
              <button className="button is-dark-blue is-fullwidth" onClick={handlePlaceOrder}> Print and Confirm Order</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProceedRestaurant;
