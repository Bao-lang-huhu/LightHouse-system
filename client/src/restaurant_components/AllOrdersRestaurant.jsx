import React, { useEffect, useState } from 'react';
import 'bulma/css/bulma.min.css';
import '../App.css';
import './components_r.css';
import { IoPencilOutline, IoSearchCircle, IoCloseSharp, IoTrashBinOutline, IoReaderOutline } from 'react-icons/io5';
import axios from 'axios';
import OrderSummary from '../restaurant_modals/OrderSummary';
import ErrorMsg from '../messages/errorMsg'; // Import Error Message Component
import SuccessMsg from '../messages/successMsg'; // Import Success Message Component
import { ClipLoader } from 'react-spinners';
const AllOrdersRestaurant = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState(''); // State for status filter
  const [dateFilter, setDateFilter] = useState(''); // State for date filter
  const [isArchiving, setIsArchiving] = useState(false); // State for archiving confirmation modal
  const [archiveOrderId, setArchiveOrderId] = useState(null); // State to store the order ID to be archived
  const [archiveSuccess, setArchiveSuccess] = useState(''); // State for archiving success message
  const [archiveError, setArchiveError] = useState(''); // State for archiving error message
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchOrders = async () => {
        setLoading(true); // Set loading to true when fetching starts

        try {
            const response = await axios.get('http://localhost:3001/api/getFoodOrdersAll');
            // Filter out orders with 'DELETE' status
            const activeOrders = response.data.filter(order => order.f_order_status !== 'DELETE');
            setOrders(activeOrders);
            setFilteredOrders(activeOrders); // Initialize filteredOrders with active orders
        } catch (error) {
            console.error('Error fetching food orders:', error);
        } finally {
            setLoading(false); // Set loading to false when fetching ends
        }
    };

    fetchOrders();
}, []);

  useEffect(() => {
    let filtered = [...orders];

    // Apply status filter, exclude 'DELETE' status
    if (statusFilter) {
      filtered = filtered.filter(order => order.f_order_status === statusFilter);
    }

    // Apply date filter
    if (dateFilter) {
      filtered = filtered.filter(order => new Date(order.f_order_date).toLocaleDateString() === new Date(dateFilter).toLocaleDateString());
    }

    setFilteredOrders(filtered);
  }, [statusFilter, dateFilter, orders]);

  const toggleModal = async (order) => {
    if (order) {
      try {
        const response = await axios.get(`http://localhost:3001/api/getFoodOrderById/${order.food_order_id}`);
        setSelectedOrder(response.data);
      } catch (error) {
        console.error('Error fetching order details:', error);
      }
    }
    setIsModalOpen(!isModalOpen); // Toggle modal visibility
  };

  // Function to handle archive confirmation and API call
  const confirmArchive = (orderId) => {
    setArchiveOrderId(orderId);
    setIsArchiving(true); // Show the confirmation modal
  };

  const handleArchive = async () => {
    if (!archiveOrderId) return;
    try {
      // Send request to update order status to 'DELETE'
      const response = await axios.put(`http://localhost:3001/api/updateOrderStatus/${archiveOrderId}`, {
        new_status: 'DELETE',
      });
      if (response.status === 200) {
        // Remove the archived order from the orders list
        const updatedOrders = orders.filter(order => order.food_order_id !== archiveOrderId);
        setOrders(updatedOrders);
        setFilteredOrders(updatedOrders);
        setArchiveSuccess('Order archived successfully.');
      } else {
        setArchiveError('Failed to archive the order. Please try again.');
      }
    } catch (error) {
      console.error('Error archiving the order:', error);
      setArchiveError('Failed to archive the order. Please try again.');
    } finally {
      setIsArchiving(false); 
      setArchiveOrderId(null); 
    }
  };

 
  const handleStatusFilter = (status) => {
    if (statusFilter === status) {
      setStatusFilter(''); // Reset filter to show all orders
    } else {
      setStatusFilter(status); // Set to selected status
    }
  };

  return (
    <section className='section-p1'>
      <header>
        <div style={{ backgroundColor: 'white', borderRadius: '10px 10px' }}>
          <div className='column is-multiline is-mobile'>
            <h1 className='subtitle'>
              <strong>All Food Orders</strong>
            </h1>
          </div>
          <div className="container section-p1">
            <div className="column is-hidden-tablet-only custom-hide-tablet is-fullwidth" style={{ padding: '0', margin: '0' }}>
            <div className="field has-addons is-flex is-flex-direction-row is-fullwidth-mobile">
              <div className="control is-expanded is-fullwidth">
                <input
                  className="input is-fullwidth-mobile"
                  type="date"
                  style={{ margin: '0' }}
                  placeholder="Search..."
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)} // Set date filter
                />
              </div>
              <div className="control is-fullwidth">
                <button className="button is-blue is-fullwidth-mobile" style={{ height: '100%' }}>
                  <IoSearchCircle className="is-white mr-1" /> Search...
                </button>
              </div>
              <div className="control is-fullwidth">
                <button
                  className="button is-light is-fullwidth-mobile"
                  style={{ height: '100%' }}
                  onClick={() => setDateFilter('')} // Clear the date filter
                >
                  Clear
                </button>
              </div>
            </div>

            </div>
            <h1 className='subtitle'> Filter (Status) </h1>
            <div className="columns is-multiline is-mobile">
              <div className="column is-6">
                <div
                  className={`button is-dark-blue box has-text-centered ${statusFilter === 'COMPLETE' ? 'is-selected' : ''}`}
                  onClick={() => handleStatusFilter('COMPLETE')} // Use the toggle function
                >
                  <span>
                    <IoReaderOutline size={30} className="is-violet" />
                  </span>
                  <p className="is-size-5 has-text-weight-semibold mt-2">Completed</p>
                </div>
              </div>

              <div className="column is-6">
                <div
                  className={`button is-red box has-text-centered ${statusFilter === 'CANCELED' ? 'is-selected' : ''}`}
                  onClick={() => handleStatusFilter('CANCELED')} // Use the toggle function
                >
                  <span>
                    <IoTrashBinOutline size={30} className="is-violet" />
                  </span>
                  <p className="is-size-5 has-text-weight-semibold mt-2">Canceled</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <section className='section-p1'>
            <div className='container-white-space'>
                {/* Archiving Success and Error Messages */}
                {archiveSuccess && <SuccessMsg message={archiveSuccess} />}
                {archiveError && <ErrorMsg message={archiveError} />}

                {/* Show ClipLoader while loading */}
                {loading ? (
                    <div className="has-text-centered">
                        <ClipLoader color="#3498db" size={60} />
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table is-striped is-hoverable is-fullwidth">
                            <thead>
                                <tr>
                                    <th className="has-text-left is-table-blue">No.</th>
                                    <th className="has-text-left is-table-blue">Staff</th>
                                    <th className="has-text-left is-table-blue">Guest</th>
                                    <th className="has-text-left is-table-blue">Date</th>
                                    <th className="has-text-left is-table-blue">Payment Method</th>
                                    <th className="has-text-left is-table-blue">Total Cost</th>
                                    <th className="has-text-left is-table-blue">Status</th>
                                    <th className="has-text-center is-table-blue" colSpan="2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order, index) => (
                                    <tr className="has-text-left" key={order.food_order_id}>
                                        <td>{index + 1}</td>
                                        <td>{order.STAFF ? `${order.STAFF.staff_fname} ${order.STAFF.staff_lname}` : 'No Staff'}</td>
                                        <td>{order.guest_fname && order.guest_lname ? `${order.guest_fname} ${order.guest_lname}` : 'Resto Guest'}</td>
                                        <td>{new Date(order.f_order_date).toLocaleDateString()}</td>
                                        <td>{order.f_payment_method}</td>
                                        <td>₱{order.f_order_total.toFixed(2)}</td>
                                        <td>{order.f_order_status}</td>
                                        <td className="has-text-center is-justify-content-space-between" colSpan="2">
                                            <button className="button is-small is-blue" style={{ margin: '0.5rem' }} onClick={() => toggleModal(order)}>
                                                <IoPencilOutline style={{ marginRight: '0.5rem' }} />
                                                Details
                                            </button>
                                            <button className="button is-small is-red" style={{ margin: '0.5rem' }} onClick={() => confirmArchive(order.food_order_id)}>
                                                <IoCloseSharp style={{ marginRight: '0.5rem' }} />
                                                Archive
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>

      {selectedOrder && <OrderSummary isOpen={isModalOpen} toggleModal={toggleModal} order={selectedOrder} />}

      {isArchiving && (
        <div className="modal is-active">
          <div className="modal-background" onClick={() => setIsArchiving(false)}></div>
          <div className="modal-content">
            <div className="box">
              <p>Are you sure you want to archive this food order?</p>
              <div className="buttons is-right">
                <button className="button is-danger" onClick={handleArchive}>Yes</button>
                <button className="button" onClick={() => setIsArchiving(false)}>No</button>
              </div>
            </div>
          </div>
          <button className="modal-close is-large" aria-label="close" onClick={() => setIsArchiving(false)}></button>
        </div>
      )}
    </section>
  );
};

export default AllOrdersRestaurant;
