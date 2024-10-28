import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import './pages.css';
import '../App.css';
import { IoPlayBack , IoPlayForward } from 'react-icons/io5';
import { useLocation, useNavigate } from 'react-router-dom';
import AddTableReservation from '../guest_modals/AddTableReservation';
import { Box, Typography, Grid, Button, IconButton } from '@mui/material';
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

  const table_guest_quantity = parseInt(localStorage.getItem('table_guest_quantity'), 10) || 0;

  useEffect(() => {
    const guestId = localStorage.getItem('guest_id');
    setIsLoggedIn(!!guestId); 
  }, []);

  // Function to fetch tables and their reservation statuses
  const fetchAvailableTables = async () => {
    setLoading(true);
    const table_reservation_date = localStorage.getItem('table_reservation_date');
    const table_time = localStorage.getItem('table_reservation_time');

    try {
      const response = await axios.get('https://light-house-system-h74t-server.vercel.app/api/getTableReservations2', {
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'background.paper', boxShadow: 1, p: 2, borderRadius: 1 }}>
      
              {/* Legends Section */}
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Legends:
                </Typography>
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs={6} sm={4} md={2}>
                    <Box display="flex" alignItems="center">
                      <Box sx={{ width: 12, height: 12, bgcolor: '#FFC107', borderRadius: '50%', mr: 1, border: '1px solid black' }} />
                      <Typography variant="body2">Pending/Confirmed</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <Box display="flex" alignItems="center">
                      <Box sx={{ width: 12, height: 12, bgcolor: 'red', borderRadius: '50%', mr: 1, border: '1px solid black' }} />
                      <Typography variant="body2">Unavailable</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <Box display="flex" alignItems="center">
                      <Box sx={{ width: 12, height: 12, bgcolor: '#FFF', borderRadius: '50%', mr: 1, border: '1px solid black' }} />
                      <Typography variant="body2">Selected</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <Box display="flex" alignItems="center">
                      <Box sx={{ width: 12, height: 12, bgcolor: 'grey', borderRadius: '50%', mr: 1, border: '1px solid black' }} />
                      <Typography variant="body2">Seat Incompatibility</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <Box display="flex" alignItems="center">
                      <Box sx={{ width: 12, height: 12, bgcolor: '#C7F5FF', borderRadius: '50%', mr: 1, border: '1px solid black' }} />
                      <Typography variant="body2">Available</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

      {/* Pagination Controls Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        {currentIndex > 0 && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<IoPlayBack />}
            onClick={handlePreviousPage}
            sx={{ mr: 1 }}
          >
            Previous For Fixed Groups
          </Button>
        )}
        {currentIndex + tablesPerPage < availableTables.length && (
          <Button
            variant="contained"
            color="primary"
            endIcon={<IoPlayForward />}
            onClick={handleNextPage}
          >
            Next For Larger Groups
          </Button>
        )}
      </Box>
    </Box>


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
