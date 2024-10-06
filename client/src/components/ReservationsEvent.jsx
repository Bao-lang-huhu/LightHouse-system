import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IoEyeOutline, IoSearchCircle } from 'react-icons/io5';
import axios from 'axios'; // Import axios for API calls
import '../App.css';

const ReservationsEvent = () => {
  const [ongoingReservations, setOngoingReservations] = useState([]);
  const [reservationHistory, setReservationHistory] = useState([]);
  const [filteredOngoing, setFilteredOngoing] = useState([]); // For filtered ongoing reservations
  const [filteredHistory, setFilteredHistory] = useState([]); // For filtered history
  const [searchTerm, setSearchTerm] = useState(''); // State for search input
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReservations = async () => {
      const guestId = localStorage.getItem('guest_id');  // Fetch guest_id from localStorage
  
      // Add check if guest_id exists
      if (!guestId) {
        setError('Guest ID not found. Please log in.');
        return;
      }
  
      try {
        const response = await axios.get('https://light-house-system-h74t-server.vercel.app/api/getEventReservationsByGuestId', {
          params: { guest_id: guestId }
        });
        const reservations = response.data;
  
        const ongoing = reservations.filter(res => res.event_status === 'CONFIRMED');
        setOngoingReservations(ongoing);
        setFilteredOngoing(ongoing); // Set filtered ongoing initially same as ongoing
  
        const history = reservations.filter(res => ['COMPLETED', 'CANCELED'].includes(res.event_status));
        setReservationHistory(history);
        setFilteredHistory(history); // Set filtered history initially same as history
  
      } catch (error) {
        console.error('Error fetching event reservations:', error);
        setError('Failed to load event reservations. ' + (error.message || ''));
      }
    };
  
    fetchReservations();
  }, []);
  

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Function to handle filtering by event date
  const handleSearch = () => {
    if (!searchTerm) {
      setFilteredOngoing(ongoingReservations); // Reset to unfiltered list
      setFilteredHistory(reservationHistory);
    } else {
      const filteredOngoing = ongoingReservations.filter(reservation =>
        reservation.event_date.includes(searchTerm)
      );
      const filteredHistory = reservationHistory.filter(reservation =>
        reservation.event_date.includes(searchTerm)
      );
      setFilteredOngoing(filteredOngoing);
      setFilteredHistory(filteredHistory);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm(''); // Clear the search input
    setFilteredOngoing(ongoingReservations); // Reset to the original reservations list
    setFilteredHistory(reservationHistory);
  };

  if (error) {
    return <div className="notification is-danger">{error}</div>;
  }

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
      <h2 className="title is-4 has-text-white">Event Reservations</h2>

      {/* Search Bar */}
      <div className="column is-hidden-tablet-only custom-hide-tablet is-fullwidth" style={{ padding: '0', margin: '0' }}>
        <div className="field has-addons is-flex is-flex-direction-row is-fullwidth-mobile">
          <div className="control is-expanded is-fullwidth">
            <input
              className="input is-fullwidth-mobile"
              type="date"
              style={{ margin: '0' }}
              placeholder="Search by event date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <div className="control is-fullwidth">
            <button className="button is-blue is-fullwidth-mobile" style={{ height: '100%' }} onClick={handleSearch}>
              <IoSearchCircle className="is-white" />
            </button>
          </div>
          <div className="control is-fullwidth ml-2">
            <button className="button is-light is-fullwidth-mobile" style={{ height: '100%' }} onClick={handleClearSearch}>
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Ongoing Reservations */}
      <div className="box">
        <h3 className="title is-5">Ongoing Reservations</h3>
        {filteredOngoing.length > 0 ? (
          filteredOngoing.map((reservation) => (
            <div className='box' style={{ border: "2px solid #0077B7" }} key={reservation.event_reservation_id}>
              <div className="columns is-mobile is-multiline">
                {/* Left Column: Reservation ID, Event Date */}
                <div className="column is-12-mobile is-6-tablet is-4-desktop">
                  <p><strong>Reservation ID:</strong> #{reservation.event_reservation_id}</p>
                  <div className='m-2'>
                    <p><strong>Event Date:</strong> {formatDate(reservation.event_date)}</p>
                  </div>
                  <p><strong>Venue:</strong> {reservation.venue_name || 'N/A'}</p>
                </div>

                {/* Middle Column: Event Details */}
                <div className="column is-12-mobile is-6-tablet is-4-desktop">
                  <p className='subtitle is-5'><strong>Total Cost:</strong> ₱{reservation.event_total_price}</p>
                  <p><strong>Guests:</strong> {reservation.event_no_guest}</p>
                  <p><strong>Downpayment:</strong> ₱{reservation.event_downpayment || 'N/A'}</p>
                </div>

                {/* Right Column: Status and Buttons */}
                <div className="column is-12-mobile is-12-tablet is-4-desktop">
                  <div className="buttons are-small is-flex is-flex-direction-column is-align-items-center">
                    <div className="is-flex is-left is-justify-content-space-between mb-2">
                      <label className='label'>Status: </label>
                      <button className={`button ${getStatusButtonClass(reservation.event_status)} ml-1`}>
                        {reservation.event_status}
                      </button>
                    </div>
                    <Link to={`/reservations/event_reservation_details/${reservation.event_reservation_id}`} className="button is-blue is-fullwidth">
                      <IoEyeOutline className='mr-1' />
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No ongoing reservations.</p>
        )}
      </div>

      {/* Reservation History */}
      <div className="box">
        <h3 className="title is-5">Reservation History</h3>
        {filteredHistory.length > 0 ? (
          filteredHistory.map((reservation) => (
            <div className='box' style={{ border: "2px solid #0077B7" }} key={reservation.event_reservation_id}>
              <div className="columns is-mobile is-multiline">
                {/* Left Column: Reservation ID, Event Date */}
                <div className="column is-12-mobile is-6-tablet is-4-desktop">
                  <p><strong>Reservation ID:</strong> #{reservation.event_reservation_id}</p>
                  <div className='m-2'>
                    <p><strong>Event Date:</strong> {formatDate(reservation.event_date)}</p>
                  </div>
                  <p><strong>Venue:</strong> {reservation.venue_name || 'N/A'}</p>
                </div>

                {/* Middle Column: Event Details */}
                <div className="column is-12-mobile is-6-tablet is-4-desktop">
                  <p className='subtitle is-5'><strong>Total Cost:</strong> ₱{reservation.event_total_price}</p>
                  <p><strong>Guests:</strong> {reservation.event_no_guest}</p>
                </div>

                {/* Right Column: Status and Buttons */}
                <div className="column is-12-mobile is-12-tablet is-4-desktop">
                  <div className="buttons are-small is-flex is-flex-direction-column is-align-items-center">
                    <div className="is-flex is-left is-justify-content-space-between mb-2">
                      <label className='label'>Status: </label>
                      <button className={`button ${getStatusButtonClass(reservation.event_status)} ml-1`}>
                        {reservation.event_status}
                      </button>
                    </div>
                    <Link to={`/reservations/event_reservation_details/${reservation.event_reservation_id}`} className="button is-blue is-fullwidth">
                      <IoEyeOutline className='mr-1' />
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
              {reservation.event_status === 'CANCELED' && (
                <div className="notification is-danger">
                  <p><strong>Reason for cancellation:</strong> {reservation.cancel_reservation_request || 'No reason provided.'}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No reservation history available.</p>
        )}
      </div>
    </div>
  );
};

export default ReservationsEvent;
