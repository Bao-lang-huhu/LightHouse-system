import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import './pages.css';
import '../App.css';
import { useLocation, useNavigate } from 'react-router-dom';
import AddTableReservation from '../guest_modals/AddTableReservation';
import Breadcrumbs from '../layouts/Breadcrumbs';
import axios from 'axios';

function Resturant_Second() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedTable, setSelectedTable] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableTables, setAvailableTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Retrieve table_guest_quantity from localStorage
  const table_guest_quantity = parseInt(localStorage.getItem('table_guest_quantity'), 10) || 0;

  // Check if the guest is logged in by checking guest_id in localStorage
  useEffect(() => {
    const guestId = localStorage.getItem('guest_id');
    if (guestId) {
      setIsLoggedIn(true); // User is logged in
    } else {
      setIsLoggedIn(false); // User is not logged in
    }
  }, []);

  // Function to fetch tables and their reservation statuses
  const fetchAvailableTables = async () => {
    setLoading(true);
    const table_reservation_date = localStorage.getItem('table_reservation_date');
    const table_time = localStorage.getItem('table_reservation_time');

    try {
      const response = await axios.get('https://light-house-system-h74t-server.vercel.app/api/getTableReservations2', {
        params: {
          table_reservation_date,
          table_time,
        },
      });
      setAvailableTables(response.data); // Load all tables with their statuses
    } catch (error) {
      console.error('Error fetching available tables:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tables on mount or when relevant data changes
  useEffect(() => {
    fetchAvailableTables();
  }, [location]);

  // Toggle the modal state
  const toggleModal = () => {
    if (!isLoggedIn) {
      // If the guest is not logged in, redirect to login
      navigate('/login', {
        state: { from: location.pathname },
      });
    } else {
      setIsModalOpen(!isModalOpen); // Proceed with the modal if logged in
    }
  };

  // Handle table selection
  const handleTableSelection = (table) => {
    if (table.status === 'AVAILABLE') {
      setSelectedTable(table.table_id);
      localStorage.setItem('selected_table_id', table.table_id);
      localStorage.setItem('selected_table_name', table.table_name);
    }
  };

  // Function to assign chair classes based on seat quantity
  const getChairClasses = (seat_quantity) => {
    switch (seat_quantity) {
      case 4:
        return ['top-left-chair', 'top-right-chair', 'bottom-left-chair', 'bottom-right-chair'];
      case 6:
        return ['top-left-chair', 'top-middle-chair', 'top-right-chair', 'bottom-left-chair', 'bottom-middle-chair', 'bottom-right-chair'];
      case 8:
        return [
          'top-left-chair', 'top-center-left-chair', 'top-center-right-chair', 'top-right-chair',
          'bottom-left-chair', 'bottom-center-left-chair', 'bottom-center-right-chair', 'bottom-right-chair',
        ];
      default:
        return [];
    }
  };

  const getButtonColorClass = (table) => {
    if (selectedTable === table.table_id) {
      return 'is-selected'; // Highlight selected table
    }
    if (['PENDING', 'CONFIRMED', 'RESERVED'].includes(table.status)) {
      return 'is-reserved'; // Dark Blue for reserved tables
    }
    return 'is-available'; // Light Blue for available tables
  };

  const breadcrumbItems = [
    { label: 'Home', link: '/' },
    { label: 'Restaurant Date Reservation', link: '/resturant_filtering' },
    { label: 'Restaurant Booking' },
  ];

  return (
    <section className="section-m1">
      <div>
        {/* Breadcrumb Section */}
        <div>
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Table Reservation Section */}
        <div className="container event-bg-style" style={{ marginBottom: '3%' }}>
          <p className="subtitle has-text-white">LightHouse Point Hotel (Captain Galley's) - 3rd Floor</p>
          <div className="columns is-vcentered is-multiline event-padding-style">
            <div className="event-padding-style event-color-table column is-full-desktop">
              <p className="subtitle has-text-white">Restaurant Tables (3rd Floor - Open Area)</p>
              <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {loading ? (
                  <p>Loading available tables...</p>
                ) : (
                  <div className="columns is-multiline section-p1">
                    {availableTables.map((table) => {
                      const chairClasses = getChairClasses(table.seat_quantity);

                      return (
                        <div className="column is-full-mobile is-half-tablet is-one-third-desktop" key={table.table_id}>
                          <div className="table-container">
                            <div className="table-circle">
                              <button
                                className={`button ${getButtonColorClass(table)}`} // Apply button styling
                                onClick={() => handleTableSelection(table)}
                                disabled={table.seat_quantity !== table_guest_quantity} // Disable tables with different seat quantities
                              >
                                <div className="column has-text-centered is-circle">
                                  <p className="is-4">
                                    <strong>{table.table_name}</strong>
                                  </p>
                                  <p>({table.seat_quantity} Seats)</p>
                                  <p>{table.status}</p>
                                </div>
                              </button>
                            </div>
                            <div className="chairs-wrapper">
                              {chairClasses.map((chairClass, i) => (
                                <div key={i} className={`chair ${chairClass}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reservation Button */}
          <div className="buttons is-centered">
            <button className="button is-blue search-reservation" type="submit" onClick={toggleModal} disabled={!selectedTable}>
              {isLoggedIn ? 'PROCEED TO RESERVATION' : 'SIGN IN TO RESERVE'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal for Table Reservation */}
      {isLoggedIn && <AddTableReservation isOpen={isModalOpen} toggleModal={toggleModal} selectedTable={selectedTable} />}
    </section>
  );
}

export default Resturant_Second;
