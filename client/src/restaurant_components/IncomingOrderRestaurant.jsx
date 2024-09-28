import React, { useEffect, useState } from 'react';
import 'bulma/css/bulma.min.css';
import './components_r.css';
import { IoThumbsUpOutline, IoTrashBinOutline } from 'react-icons/io5';
import axios from 'axios';
import SuccessMsg from '../messages/successMsg';
import ErrorMsg from '../messages/errorMsg';

const IncomingOrderRestaurant = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/getFoodOrders');
        setOrders(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching food orders:', error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Function to update the status of an order
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.put(`http://localhost:3001/api/updateOrderStatus/${orderId}`, {
        new_status: newStatus, // Send the new status in the request body
      });

      if (response.status === 200) {
        setShowSuccess(true);
        setMessage(`Order status updated to ${newStatus} successfully!`);

        // Update the local state to reflect the changes
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.food_order_id === orderId ? { ...order, f_order_status: newStatus } : order
          )
        );

        // Hide the success message after 2 seconds and update the UI
        setTimeout(() => {
          setShowSuccess(false);
          // Remove the order from the list
          setOrders((prevOrders) => prevOrders.filter((order) => order.food_order_id !== orderId));
        }, 2000);
      } else {
        setShowError(true);
        setMessage('Failed to update order status. Please try again.');
        setTimeout(() => setShowError(false), 2000);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setShowError(true);
      setMessage('Failed to update order status. Please try again.');
      setTimeout(() => setShowError(false), 2000);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <section className="section-p1">
      <div className='container-white-space'>
        <h1 className="subtitle">
          <strong>Incoming Orders</strong>
        </h1>

        {/* Success and Error Messages */}
        {showSuccess && <SuccessMsg message={message} />}
        {showError && <ErrorMsg message={message} />}

        <div className="columns is-multiline is-mobile is-vcentered">
          {orders.map((order, index) => (
            <div className="column is-4-desktop is-6-tablet is-12-mobile" key={order.food_order_id}>
              <div className="box" style={{ border: '1px solid #e0e0e0', borderRadius: '8px', position: 'relative' }}>
                <div className='card-circle-order'>
                  {index + 1}
                </div>

                <div className='card-content'>
                  <p>
                    <strong>Order ID:</strong> {order.food_order_id}
                  </p>
                  <p>
                    <strong>Staff Username:</strong> {order.staff_username}
                  </p>
                  {order.check_in_id ? (
                    <>
                      <p>
                        <strong>Guest Name:</strong> {order.guest_fname} {order.guest_lname}
                      </p>
                      <p>
                        <strong>Room Number:</strong> {order.room_number}
                      </p>
                      <p>
                        <strong>Room Type:</strong> {order.room_type_name}
                      </p>
                    </>
                  ) : (
                    <p>
                      <strong>Payment Method:</strong> {order.f_payment_method}
                    </p>
                  )}
                  <p>
                    <strong>Date:</strong> {new Date(order.f_order_date).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Total Cost:</strong> ₱{order.f_order_total.toFixed(2)}
                  </p>

                  {/* Table with Food and Quantity */}
                  {order.foodItems && order.foodItems.length > 0 ? (
                    <div>
                      <table className="table is-fullwidth is-striped is-hoverable">
                        <thead>
                          <tr>
                            <th className="has-text-centered">Food Item</th>
                            <th className="has-text-centered">Quantity</th>
                            <th className="has-text-centered">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.foodItems.map((item, itemIndex) => (
                            <tr key={item.food_order_list_id}>
                              <td className="has-text-centered">{item.food_name}</td>
                              <td className="has-text-centered">{item.f_order_qty}</td>
                              <td className="has-text-centered">₱{item.f_order_subtotal.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p>No food items found for this order.</p>
                  )}

                  {/* Notes Section */}
                  <div style={{ marginTop: '1rem' }}>
                    <label className="label"><strong>Notes:</strong></label>
                    <textarea
                      value={order.f_notes || ''}
                      placeholder="No additional notes."
                      className="textarea"
                      readOnly
                      style={{ width: '100%', minHeight: '100px' }}
                    />
                  </div>
                </div>

                <div className="card-footer justify-content-between">
                  <button
                    className="button is-medium is-blue card-footer-item"
                    style={{ padding: '0.5rem', margin: '0.5rem' }}
                    onClick={() => updateOrderStatus(order.food_order_id, 'COMPLETE')} // Set status to COMPLETE
                  >
                    <IoThumbsUpOutline style={{ marginRight: '0.5rem' }} />
                    Done
                  </button>
                  <button
                    className="button is-medium is-danger card-footer-item"
                    style={{ padding: '0.5rem', margin: '0.5rem' }}
                    onClick={() => updateOrderStatus(order.food_order_id, 'CANCELED')} // Set status to CANCELED
                  >
                    <IoTrashBinOutline style={{ marginRight: '0.5rem' }} />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IncomingOrderRestaurant;
