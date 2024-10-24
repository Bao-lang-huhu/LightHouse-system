import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import './components_r.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TextField } from '@mui/material';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; 
import ErrorMsg from '../messages/errorMsg'; 
import SuccessMsg from '../messages/successMsg'; 
import Avatar from '@mui/material/Avatar'; 
import moment from 'moment-timezone';

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
        const response = await axios.get('http://localhost:3001/api/getCheckedInGuests');
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
      const currentDate = new Date();
      const philippineDate = new Date(currentDate.getTime() + (8 * 60 * 60 * 1000));

      const orderData = {
        staff_id: currentStaff.staff_id,
        check_in_id: selectedCheckInId,
        f_payment_method: paymentMethod,
        f_order_total: total,
        f_notes: notes,
        foodItems: foodOrders,
        order_date: philippineDate // Use the adjusted date

      };
  
      const response = await axios.post('http://localhost:3001/api/registerFoodOrders', orderData);
  
      if (response.status === 201) {
        // Set success message and clear error message
        setOrderSuccess('Order placed successfully!');
        setOrderError('');
        
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


  const printOrderDirectly = () => {
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    iframe.style.display = 'none';

    const philippineDate = moment.tz(new Date(), "Asia/Manila").format('MMMM DD, YYYY - h:mm A');

    const printDocument = iframe.contentDocument || iframe.contentWindow.document;
    printDocument.open();
    printDocument.write(`
      <html>
        <head>
          <style>
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
              }
              .print-container {
                width: 100%;
                padding: 20px;
                background-color: white;
              }
              .table {
                width: 90%;
                border-collapse: collapse;
              }
              .table th, .table td {
                padding: 8px;
                border: 1px solid #ddd;
                text-align: left;
              }
              .table th {
                background-color: #f2f2f2;
              }
              .table, .print-container, tr, td {
                page-break-inside: avoid;
              }
              .no-print-btn, .cancel-btn {
                display: none;
              }
              @page {
                size: A4;
                margin: 10mm;
              }
            }
          </style>
        </head>
        <body onload="setTimeout(() => { window.print(); window.close(); }, 500);">
          <div class="print-container">
            <h1 class="subtitle"><strong>Order Line</strong></h1>
            <p><strong>Date:</strong> ${philippineDate}</p>           
            <p><strong>Staff:</strong> ${currentStaff.staff_name}</p>
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            ${selectedCheckInId && paymentMethod === 'ROOM' ? 
                `<p><strong>Room:</strong> ${checkedInGuests.find(guest => guest.check_in_id === selectedCheckInId)?.room_number || 'Not Available'}</p>` : ''}
            ${selectedCheckInId && paymentMethod === 'ROOM' ? 
                (() => {
                    const guest = checkedInGuests.find(guest => guest.check_in_id === selectedCheckInId);
                    return `<p><strong>Guest:</strong> ${guest ? `${guest.guest_fname} ${guest.guest_lname}` : 'Not Available'}</p>`;
                })() : ''}
            ${selectedCheckInId && paymentMethod === 'ROOM' ? 
                `<p><strong>Room Type:</strong> ${checkedInGuests.find(guest => guest.check_in_id === selectedCheckInId)?.room_type_name || 'Not Available'}</p>` : ''}
                 
            <table class="table">
              <thead>
                <tr>
                  <th>Food Item</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${foodOrders.map(item => `
                  <tr>
                    <td>${item.food_name}</td>
                    <td>${item.quantity}</td>
                    <td>₱${(item.food_price * item.quantity).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div style="margin-top: 15px;">
              <p><strong>Notes:</strong> ${notes.trim() ? notes : "No Notes..."}</p>
            </div>
            <p><strong>Total:</strong> ₱${total.toFixed(2)}</p>
          </div>
        </body>
      </html>
    `);

    printDocument.close();

    iframe.onload = () => {
      setTimeout(() => {
          document.body.removeChild(iframe);
      }, 1000);
  };
    handlePlaceOrder();
};


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
                        <Avatar
                            src={item.food_photo || 'https://via.placeholder.com/64'}
                            alt={item.food_name}
                            style={{
                              width: 64,
                              height: 64,
                              margin: 'auto',
                              objectFit: 'cover',
                              borderRadius: '8px'
                            }}
                            imgProps={{ style: { objectFit: 'cover' } }}
                          />
                        </td>
                        <td className='is-size-5'>{item.food_name}</td>
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
                        <td className='is-size-5'>₱{(item.food_price * item.quantity).toFixed(2)}</td>
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
              <button className="button is-blue is-fullwidth" onClick={printOrderDirectly}>Print and Confirm Order</button>
            </div>
          </div>
        </div>
      </div>

     




    </section>
  );
};

export default ProceedRestaurant;
