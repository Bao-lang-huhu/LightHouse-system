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
  const [currentIndex, setCurrentIndex] = useState(0); // Start at index 0
  const tablesPerPage = 9; // Display 9 tables per page

  // Retrieve table_guest_quantity from localStorage
  const table_guest_quantity = parseInt(localStorage.getItem('table_guest_quantity'), 10) || 0;

  // Check if the guest is logged in by checking guest_id in localStorage
  useEffect(() => {
    const guestId = localStorage.getItem('guest_id');
    setIsLoggedIn(!!guestId); // Set login state based on guest_id presence
  }, []);

  // Function to fetch tables and their reservation statuses
  const fetchAvailableTables = async () => {
    setLoading(true);
    const table_reservation_date = localStorage.getItem('table_reservation_date');
    const table_time = localStorage.getItem('table_reservation_time');

    try {
      const response = await axios.get('http://localhost:3001/api/getTableReservations2', {
        params: { table_reservation_date, table_time },
      });
      const sortedTables = response.data.sort((a, b) => a.table_name.localeCompare(b.table_name));
      setAvailableTables(sortedTables); // Load all tables with their statuses
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
        return ['top-left-chair', 'top-middle-chair', 'top-right-chair', 
          'bottom-left-chair', 'bottom-middle-chair', 'bottom-right-chair'];
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
    if (table.status === 'UNAVAILABLE') {
      return 'is-unavailable'; // Custom class for unavailable tables
    }
    if (table.seat_quantity !== table_guest_quantity) {
      return 'is-disabled'; // Grey for mismatched seat quantities
    }
    if (table.status === 'PENDING') {
      return 'is-warning'; // Yellow for pending tables
    }
    if (table.status === 'CONFIRMED') {
      return 'is-info'; // Blue for confirmed tables
    }
    if (table.status === 'RESERVED') {
      return 'is-danger'; // Red for reserved tables
    }
    return 'is-available'; // Light Blue for available tables
  };
  

  // Carousel-style table display
  const currentTables = availableTables.slice(currentIndex, currentIndex + tablesPerPage);

  const handleNextPage = () => {
    if (currentIndex + tablesPerPage < availableTables.length) {
      setCurrentIndex(currentIndex + tablesPerPage);
    }
  };

  const handlePreviousPage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - tablesPerPage);
    }
  };

  // Define the toggleModal function here
  const toggleModal = () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: location.pathname } });
    } else {
      setIsModalOpen(!isModalOpen);
    }
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
          <div className="columns is-vcentered is-multiline event-padding-style">
            <div className="event-padding-style event-color-table column is-full-desktop">
              <p className="subtitle has-text-white">LightHouse Point Hotel (Captain Galley's) - 3rd Floor</p>
              <div className="box p-2 label">
                <label>Legends:</label>
                <div className="columns is-mobile is-multiline is-gapless">
                  <div className="column is-half-mobile is-one-fifth">
                    <div className="is-flex is-align-items-center">
                      <span
                        className="is-inline-block"
                        style={{ width: '10px', height: '10px', backgroundColor: '#FFC107', borderRadius: '50%', marginRight: '5px', border: "1px solid black" }}
                      ></span>
                      Pending/Confirmed
                    </div>
                  </div>
                  <div className="column is-half-mobile is-one-fifth">
                    <div className="is-flex is-align-items-center">
                      <span
                        className="is-inline-block"
                        style={{ width: '10px', height: '10px', backgroundColor: 'red', borderRadius: '50%', marginRight: '5px', border: "1px solid black" }}
                      ></span>
                      Unavailable
                    </div>
                  </div>
                  <div className="column is-half-mobile is-one-fifth">
                    <div className="is-flex is-align-items-center">
                      <span
                        className="is-inline-block"
                        style={{ width: '10px', height: '10px', backgroundColor: '#FFF', borderRadius: '50%', marginRight: '5px', border: "1px solid black" }}
                      ></span>
                      Selected
                    </div>
                  </div>
                  <div className="column is-half-mobile is-one-fifth">
                    <div className="is-flex is-align-items-center">
                      <span
                        className="is-inline-block"
                        style={{ width: '10px', height: '10px', backgroundColor: 'grey', borderRadius: '50%', marginRight: '5px', border: "1px solid black" }}
                      ></span>
                      Seat Incompatibility
                    </div>
                  </div>
                  <div className="column is-half-mobile is-one-fifth">
                    <div className="is-flex is-align-items-center">
                      <span
                        className="is-inline-block"
                        style={{ width: '10px', height: '10px', backgroundColor: '#C7F5FF', borderRadius: '50%', marginRight: '5px', border: "1px solid black" }}
                      ></span>
                      Available
                    </div>
                  </div>
                </div>
              </div>


              <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {loading ? (
                  <p>Loading available tables...</p>
                ) : (
                  <>
                    <div className="columns is-multiline section-p1">
                      {currentTables.map((table) => {
                        const chairClasses = getChairClasses(table.seat_quantity);
                        return (
                          <div className="column is-full-mobile is-half-tablet is-one-third-desktop" key={table.table_id}>
                            <div className="table-container">
                              <div className="table-circle">
                                <button
                                  className={`button ${getButtonColorClass(table)}`} // Apply button styling
                                  onClick={() => handleTableSelection(table)}
                                  disabled={table.seat_quantity !== table_guest_quantity || table.status !== 'AVAILABLE'} // Disable for unavailable or mismatched seat quantity
                                >
                                  <div className="column has-text-centered is-circle">
                                    <p className="is-4">
                                      <strong>{table.table_name}</strong>
                                    </p>
                                    {/* Conditionally render seat quantity for tables with less than 8 seats */}
                                    {table.seat_quantity < 8 && <p>({table.seat_quantity} Seats)</p>}
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

                    {/* Pagination Controls */}
                    <div className="pagination-controls has-text-centered">
                      {currentIndex > 0 && (
                        <button className="button is-small" onClick={handlePreviousPage}>
                          Previous for Fixed tables
                        </button>
                      )}
                      {currentIndex + tablesPerPage < availableTables.length && (
                        <button className="button is-small" onClick={handleNextPage}>
                          Next for Larger Groups
                        </button>
                      )}
                    </div>
                  </>
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
