import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IoEyeOutline, IoSearchCircle } from 'react-icons/io5';
import axios from 'axios';  // Import axios for API calls
import '../App.css';
import { CardMedia } from '@mui/material';

const ReservationsRoom = () => {
  const [ongoingReservations, setOngoingReservations] = useState([]);
  const [reservationHistory, setReservationHistory] = useState([]);
  const [filteredOngoing, setFilteredOngoing] = useState([]); // For filtered ongoing reservations
  const [filteredHistory, setFilteredHistory] = useState([]); // For filtered history
  const [searchTerm, setSearchTerm] = useState(''); // State for search input
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // State for filter by status
  const [isSearching, setIsSearching] = useState(false); // Toggle between Search and Clear buttons
  
  useEffect(() => {
    const fetchReservations = async () => {
      const guestId = localStorage.getItem('guest_id');  // Assuming guest_id is stored in localStorage
  
      if (!guestId) {
        setError('Guest ID not found. Please log in.');
        return;
      }
  
      try {
        const response = await axios.get('http://localhost:3001/api/getReservationsByGuestId', {
          params: { guest_id: guestId }
        });
  
        const reservations = response.data;
  
        if (reservations.length === 0) {
          setError('No reservations found for this guest.');
          return;
        }
  
        const ongoing = reservations.filter(res => res.reservation_status === 'CONFIRMED');
        setOngoingReservations(ongoing);
        setFilteredOngoing(ongoing); 
  
        const history = reservations.filter(res => ['COMPLETED', 'CANCELED'].includes(res.reservation_status));
        setReservationHistory(history);
        setFilteredHistory(history); 
  
      } catch (error) {
        console.error('Error fetching reservations:', error);
  
        if (error.response && error.response.status === 404) {
          setError('No room reservations found for your account.');
        } else if (error.response && error.response.status === 500){
          setError('Check your ethernet connectivity.');
        }
        else {
          setError('Failed to load reservations. ' + (error.message || ''));
        }
      }
    };
  
    fetchReservations();
  }, []);
  
  if (error) {
    return (
      <div className="box" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
        <div className="notification">
          {error}
        </div>
      </div>
    );
  }
  


  const handleSearch = () => {
    setIsSearching(true); 

    const statusMatch = (reservation) => 
      !statusFilter || reservation.reservation_status === statusFilter;
  
    if (!searchTerm) {
      setFilteredOngoing(ongoingReservations.filter(statusMatch)); // Filter by status
      setFilteredHistory(reservationHistory.filter(statusMatch)); 
    } else {
      const filteredOngoing = ongoingReservations.filter(reservation =>
        reservation.room_reservation_date.includes(searchTerm) && statusMatch(reservation)
      );
      const filteredHistory = reservationHistory.filter(reservation =>
        reservation.room_reservation_date.includes(searchTerm) && statusMatch(reservation)
      );
      setFilteredOngoing(filteredOngoing);
      setFilteredHistory(filteredHistory);
    }
  };
 

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

const formatDateTime = (dateTimeString) => {
  const date = new Date(dateTimeString);
  const formattedDate = date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });
  return `${formattedDate} at ${formattedTime}`;
};

const handleClear = () => {
  setSearchTerm(''); // Clear search term
  setStatusFilter(''); 
  setIsSearching(false);

  setFilteredOngoing(ongoingReservations); 
  setFilteredHistory(reservationHistory);  
};

  const getStatusButtonClass = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'is-info';
      case 'COMPLETED':
        return 'is-success';
      case 'CANCELED':
        return 'is-danger';
      default:
        return 'is-light';
    }
  };

  return (
    <div>
      <h2 className="title is-4 has-text-white">Room Reservation</h2>

      <div className="column is-fullwidth" style={{ padding: '0', margin: '0' }}>
  <div className="field has-addons is-flex is-flex-direction-column-mobile is-flex-direction-row-tablet is-fullwidth">
    {/* Search Input */}
    <div className="control is-expanded is-fullwidth mb-2-mobile">
      <input
        className="input"
        type="date"
        style={{ margin: '0', height: '45px' }}
        placeholder="Search by reservation date..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
    
    {/* Status Dropdown */}
    <div className="control is-fullwidth mb-2-mobile">
      <div className="select is-fullwidth" style={{ height: '45px', display: 'flex', alignItems: 'center' }}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ height: '100%', paddingTop: '0', paddingBottom: '0' }}>
          <option value="">All Statuses</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELED">Canceled</option>
        </select>
      </div>
    </div>

    {/* Search/Clear Buttons */}
    <div className="control is-fullwidth">
      {isSearching ? (
        <button className="button is-light is-fullwidth" style={{ height: '45px' }} onClick={handleClear}>
          Clear
        </button>
      ) : (
        <button className="button is-inverted-blue is-fullwidth" style={{ height: '45px' }} onClick={handleSearch}>
          <IoSearchCircle className="is-white" size={32} /> Search...
        </button>
      )}
    </div>
  </div>
</div>





      {/* Ongoing Reservations */}
<div className="box">
  <h3 className="title is-5">Ongoing Reservations</h3>

  {filteredOngoing.length > 0 ? (
    <div className="columns is-multiline">  {/* Outer columns to contain two boxes per row */}
      {filteredOngoing.map((reservation) => (
        <div className="column is-12-mobile is-6-tablet is-6-desktop" key={reservation.room_reservation_id}> 
          {/* Ensure that two boxes are in one row on tablet and desktop (6-column width) */}

          <div className="box" style={{ border: "2px solid #0077B7" }}>
            <p>Reservation Date: <strong>{formatDateTime(reservation.room_reservation_date)}</strong></p>

            <div className="columns is-mobile is-multiline">
              
              {/* Left Column: Room Photo */}
              <div className="column is-12-mobile is-6-tablet">
              {reservation.room_photo && (
                    <CardMedia
                    component="img"
                    image={reservation.room_photo}
                    alt="Room"
                    sx={{ height: 180 }}
                  />
                  )}
              </div>

              {/* Middle Column: Reservation Details */}
              <div className="column is-12-mobile is-6-tablet">
                <p className='subtitle is-5'>Total Cost: <strong>₱{reservation.total_cost}</strong></p>
                <p><strong className='title'>{reservation.room_type_name}</strong></p>
                <div className='m-2'>
                  <p>Check-in: <strong>{formatDate(reservation.room_check_in_date)}</strong></p>
                  <p>Check-out: <strong>{formatDate(reservation.room_check_out_date)}</strong></p>
                </div>
              </div>

              {/* Right Column: Status and Buttons */}
              <div className="column is-12">
                <div className="buttons are-small is-flex is-flex-direction-column is-align-items-center">
                  <div className="is-flex is-left is-justify-content-space-between mb-2">
                    <label className='label'>Status: </label>
                    <button className={`button ${getStatusButtonClass(reservation.reservation_status)} ml-1`}>
                      {reservation.reservation_status}
                    </button>
                  </div>

                  <Link to={`/reservations/room_reservation_details/${reservation.room_reservation_id}`} className="button is-blue is-fullwidth">
                    <IoEyeOutline className='mr-1' />
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p>No ongoing reservations.</p>
  )}
</div>


      {/* Reservation History */}
      <div className="box">
        <h3 className="title is-5">Reservation History</h3>

        {filteredHistory.length > 0 ? (
          <div className="columns is-multiline">  {/* Outer container to arrange two boxes per row */}
            {filteredHistory.map((reservation) => (
              <div className="column is-12-mobile is-6-tablet is-6-desktop" key={reservation.room_reservation_id}>
                {/* Ensure two boxes per row in tablet and desktop view */}
                <div className="box" style={{ border: "2px solid #0077B7" }}>
                <p>Reservation Date: <strong>{formatDateTime(reservation.room_reservation_date)}</strong></p>
  
                  <div className="columns is-mobile is-multiline">
                    {/* Left Column: Room Photo */}
                      <div className="column is-12-mobile is-6-tablet">
                      {reservation.room_photo && (
                            <CardMedia
                            component="img"
                            image={reservation.room_photo}
                            alt="Room"
                            sx={{ height: 180 }}
                          />
                          )}
                      </div>
                    
                    {/* Left Column: Reservation Date, Check-in, and Check-out */}
                    <div className="column is-12-mobile is-6-tablet">
                      <p className='subtitle is-5'>Total Cost: <strong>₱{reservation.total_cost}</strong></p>
                      <p><strong className='title'>{reservation.room_type_name}</strong></p>
                      <div className='m-2'>
                        <p>Check-in: <strong>{formatDate(reservation.room_check_in_date)}</strong></p>
                        <p>Check-out: <strong>{formatDate(reservation.room_check_out_date)}</strong></p>
                      </div>
                    </div>

                    {/* Middle Column: Total Cost */}
                    <div className="column is-12-mobile is-6-tablet">
                      <p className='subtitle is-5'><strong>Total Cost:</strong> ₱{reservation.total_cost}</p>
                    </div>

                    {/* Right Column: Buttons and Status */}
                    <div className="column is-12-mobile is-12-tablet">
                      <div className="buttons are-small is-flex is-flex-direction-column is-align-items-center">
                        <div className="is-flex is-left is-justify-content-space-between mb-2">
                          <label className='label'>Status: </label>
                          <button className={`button ${getStatusButtonClass(reservation.reservation_status)} ml-1`}>
                            {reservation.reservation_status}
                          </button>
                        </div>
                        <Link to={`/reservations/room_reservation_details/${reservation.room_reservation_id}`} className="button is-blue is-fullwidth">
                          <IoEyeOutline className='mr-1' />
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Show cancellation reason for canceled reservations */}
                  {reservation.reservation_status === 'CANCELED' && (
                    <div className="notification is-danger mt-3">
                      <p><strong>Reason for cancellation:</strong> {reservation.cancel_reservation_request || 'No reason provided.'}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No reservation history available.</p>
        )}
      </div>

    </div>
  );
};

export default ReservationsRoom;
