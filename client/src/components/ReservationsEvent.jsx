import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IoEyeOutline, IoSearchCircle } from 'react-icons/io5';
import axios from 'axios';
import '../App.css';

const ReservationsEvent = () => {
  const [ongoingReservations, setOngoingReservations] = useState([]);
  const [reservationHistory, setReservationHistory] = useState([]);
  const [filteredOngoing, setFilteredOngoing] = useState([]); // For filtered ongoing reservations
  const [filteredHistory, setFilteredHistory] = useState([]); // For filtered history
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [eventReservationsAll, setEventReservationsAll] = useState([]); // To store all event reservations

  // Step 1: Fetch guest-specific event reservations
  useEffect(() => {
    const fetchGuestReservations = async () => {
      const guestId = localStorage.getItem('guest_id');
      if (!guestId) {
        setError('Guest ID not found. Please log in.');
        return;
      }

      try {
        const guestResponse = await axios.get('http://localhost:3001/api/getEventReservationsByGuestId', {
          params: { guest_id: guestId }
        });
        const guestReservations = guestResponse.data;

        // Step 2: Fetch all event reservations
        const allReservationsResponse = await axios.get('http://localhost:3001/api/getEventReservationsAll');
        const allReservations = allReservationsResponse.data;
        setEventReservationsAll(allReservations); // Store all event reservations

        // Step 3: Combine guest reservations with full event details
        const combinedReservations = guestReservations.map(guestReservation => {
          const fullDetails = allReservations.find(
            res => res.event_reservation_id === guestReservation.event_reservation_id
          );
          return {
            ...guestReservation,
            ...fullDetails // Merging guest-specific and full event reservation details
          };
        });

        const ongoing = combinedReservations.filter(res => res.event_status === 'CONFIRMED');
        const history = combinedReservations.filter(res => ['COMPLETED', 'CANCELED'].includes(res.event_status));

        setOngoingReservations(ongoing);
        setFilteredOngoing(ongoing);
        setReservationHistory(history);
        setFilteredHistory(history);

      } catch (error) {
        console.error('Error fetching event reservations:', error);
        setError('Failed to load reservations. ' + (error.message || ''));
      }
    };

    fetchGuestReservations();
  }, []);

  // Format the event date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleSearch = () => {
    setIsSearching(true);
    const statusMatch = (reservation) => !statusFilter || reservation.event_status === statusFilter;

    if (!searchTerm) {
      setFilteredOngoing(ongoingReservations.filter(statusMatch));
      setFilteredHistory(reservationHistory.filter(statusMatch));
    } else {
      const filteredOngoing = ongoingReservations.filter(reservation =>
        reservation.event_date.includes(searchTerm) && statusMatch(reservation)
      );
      const filteredHistory = reservationHistory.filter(reservation =>
        reservation.event_date.includes(searchTerm) && statusMatch(reservation)
      );
      setFilteredOngoing(filteredOngoing);
      setFilteredHistory(filteredHistory);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setStatusFilter('');
    setIsSearching(false);
    setFilteredOngoing(ongoingReservations);
    setFilteredHistory(reservationHistory);
  };

  if (error) {
    return (
      <div className="box" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
        <div className="notification">{error}</div>
      </div>
    );
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
      <div className="column is-fullwidth" style={{ padding: '0', margin: '0' }}>
        <div className="field has-addons is-flex is-flex-direction-column-mobile is-flex-direction-row-tablet is-fullwidth">
          {/* Search Input */}
          <div className="control is-expanded is-fullwidth mb-2-mobile">
            <input
              className="input"
              type="date"
              style={{ margin: '0', height: '45px' }}
              placeholder="Search by event date..."
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
        <div className="columns is-multiline">
          {filteredOngoing.length > 0 ? (
            filteredOngoing.map((reservation) => (
              <div className="column is-12-mobile is-6-tablet is-4-desktop" key={reservation.event_reservation_id}>
                <div className="box" style={{ border: "2px solid #0077B7" }}>
                  <div className="content">
                    <p>Event Date: <strong>{formatDate(reservation.event_date)}</strong></p>
                    <p className='label is-size-4'><strong>{reservation.event_name}</strong></p>
                    <p>Event Type: <strong>{reservation.event_type}</strong></p>
                    <p>Total Cost: <strong>₱{reservation.event_total_price}</strong></p>
                    <p>Status: <span className={`button ${getStatusButtonClass(reservation.event_status)} ml-1`}>
                        {reservation.event_status}
                      </span></p>

                      <div className="buttons are-small is-flex is-flex-direction-row is-align-items-center is-fullwidth">
                        <Link to={`/reservations/event_reservation_details/${reservation.event_reservation_id}`} className="button is-blue ml-2 is-fullwidth">
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
      </div>

      {/* Reservation History */}
      <div className="box">
        <h3 className="title is-5">Reservation History</h3>
        <div className="columns is-multiline">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((reservation) => (
              <div className="column is-12-mobile is-6-tablet is-4-desktop" key={reservation.event_reservation_id}>
                <div className="box" style={{ border: "2px solid #0077B7" }}>
                  <div className="content">
                    <p>Event Date: <strong>{formatDate(reservation.event_date)}</strong></p>
                    <p className='label is-size-5'>Event Name: <strong>{reservation.event_name}</strong></p>
                    <p>Event Type: <strong>{reservation.event_type}</strong></p>
                    <p>Total Cost: <strong>₱{reservation.event_total_price}</strong></p>
                    <p>Status: <span className={`button ${getStatusButtonClass(reservation.event_status)} ml-1`}>
                        {reservation.event_status}
                      </span></p>

                      <div className="buttons are-small is-flex is-flex-direction-row is-align-items-center is-fullwidth">
                        <Link to={`/reservations/event_reservation_details/${reservation.event_reservation_id}`} className="button is-blue ml-2 is-fullwidth">
                          View Details
                        </Link>
                      </div>


                  </div>
                  {reservation.event_status === 'CANCELED' && (
                    <div className="notification is-danger">
                      <p><strong>Reason for cancellation:</strong> {reservation.cancel_reservation_request || 'No reason provided.'}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No reservation history available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationsEvent;
