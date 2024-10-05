import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';

const localizer = momentLocalizer(moment);

const RoomReservationCalendar = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null); // State for selected event (reservation)
  const [showModal, setShowModal] = useState(false); // State for showing modal
  const [downPayment, setDownPayment] = useState(900);
  const [reservationStatus, setReservationStatus] = useState('CONFIRM');
  const [cancellationRequest, setCancellationRequest] = useState('');

  // Function to fetch room reservations
  const fetchRoomReservations = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/getRoomReservationsAll');
      const reservations = response.data.map(reservation => ({
        id: reservation.room_reservation_id,
        title: reservation.room 
          ? `Room Reserved - Room ${reservation.room.room_number} (${reservation.guest.guest_fname} ${reservation.guest.guest_lname})`
          : 'Room Reservation',  // Handle null room gracefully
        start: new Date(reservation.room_check_in_date),
        end: new Date(reservation.room_check_out_date),
        status: reservation.reservation_status,
        guest: reservation.guest,  // Add guest info for the modal
        room: reservation.room     // Add room info for the modal
      }));
      setEvents(reservations);
    } catch (error) {
      console.error('Error fetching room reservations:', error);
    }
  };

  useEffect(() => {
    fetchRoomReservations(); // Fetch reservations when the component is mounted
  }, []);

  // Function to apply custom event styling based on reservation status
  const eventStyleGetter = (event) => {
    let backgroundColor = '#007bff'; // Default blue for confirmed

    switch (event.status) {
      case 'CONFIRMED':
        backgroundColor = '#007bff'; // Blue for confirmed
        break;
      case 'CANCELED':
        backgroundColor = 'red'; // Red for canceled
        break;
      case 'COMPLETED':
        backgroundColor = '#17a2b8'; // Light blue for completed
        break;
      case 'NO SHOW':
        backgroundColor = '#6c757d'; // Dark grey for no show
        break;
      default:
        backgroundColor = '#007bff'; // Default blue
        break;
    }

    return {
      style: {
        backgroundColor,
        color: 'white',
        borderRadius: '5px',
        padding: '5px',
      },
    };
  };

  // Handle event clicks
  const handleEventClick = (event) => {
    setSelectedEvent(event);  // Set the selected event
    setShowModal(true);       // Show the modal
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvent(null); // Clear selected event after closing the modal
  };

  // Handle check-in (example functionality)
  const handleCheckIn = () => {
    console.log(`Checking in reservation: ${selectedEvent.id}`);
    // Logic for handling check-in can go here (e.g., API call to update status)
    setShowModal(false);
  };

  // Handle status change (example functionality)
  const handleChangeStatus = (newStatus) => {
    setReservationStatus(newStatus);
    if (newStatus === 'CANCEL') {
      setCancellationRequest(''); // Reset cancellation notes if canceled
    }
  };

  return (
    <div style={{ margin: '20px' }}>
      {/* Legend Section */}
      <div style={{ marginBottom: '10px', display: 'flex', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ width: '10px', height: '10px', backgroundColor: '#007bff', borderRadius: '50%', marginRight: '5px' }}></span>
          Confirmed
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ width: '10px', height: '10px', backgroundColor: 'red', borderRadius: '50%', marginRight: '5px' }}></span>
          Canceled
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ width: '10px', height: '10px', backgroundColor: '#17a2b8', borderRadius: '50%', marginRight: '5px' }}></span>
          Completed
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ width: '10px', height: '10px', backgroundColor: '#6c757d', borderRadius: '50%', marginRight: '5px' }}></span>
          No Show
        </div>
      </div>

      <div style={{ height: '500px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView="month"
          style={{ height: 500 }}
          eventPropGetter={eventStyleGetter}  
          onSelectEvent={handleEventClick}  
        />
      </div>

      {/* Modal to show reservation details */}
      <div className={`modal ${showModal ? 'is-active' : ''}`}>
        <div className="modal-background" onClick={handleCloseModal}></div>
        <div className="modal-card custom-modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title">Reservation Details</p>
            <button className="delete" aria-label="close" onClick={handleCloseModal}></button>
          </header>
          <section className="modal-card-body">
            <div className="columns">
              {/* Guest Information Section */}
              <div className="column is-half">
                <div className="box">
                  <h2 className="title is-5">Guest Information</h2>
                  <div className="field">
                    <label className="label">First Name</label>
                    <div className="control">
                      <input className="input" type="text" value={selectedEvent?.guest.guest_fname || ''} readOnly />
                    </div>
                  </div>
                  <div className="field">
                    <label className="label">Last Name</label>
                    <div className="control">
                      <input className="input" type="text" value={selectedEvent?.guest.guest_lname || ''} readOnly />
                    </div>
                  </div>
                  <div className="field">
                    <label className="label">Gender</label>
                    <div className="control">
                      <input className="input" type="text" value={selectedEvent?.guest.guest_gender || ''} readOnly />
                    </div>
                  </div>
                  <div className="field">
                    <label className="label">Email</label>
                    <div className="control">
                      <input className="input" type="email" value={selectedEvent?.guest.guest_email || ''} readOnly />
                    </div>
                  </div>
                  <div className="field">
                    <label className="label">Address</label>
                    <div className="control">
                      <input className="input" type="text" value={selectedEvent?.guest.guest_address || ''} readOnly />
                    </div>
                  </div>
                  <div className="field">
                    <label className="label">Country</label>
                    <div className="control">
                      <input className="input" type="text" value={selectedEvent?.guest.guest_country || ''} readOnly />
                    </div>
                  </div>
                  <div className="field">
                    <label className="label">Contact Number</label>
                    <div className="control">
                      <input className="input" type="tel" value={selectedEvent?.guest.guest_phone_no || ''} readOnly />
                    </div>
                  </div>
                </div>
              </div>

              {/* Reservation Information and Confirmation stacked on the right side */}
              <div className="column is-half">
                {/* Reservation Information Section */}
                <div className="box">
                  <h2 className="title is-5">Reservation Information</h2>
                  <p><strong>Reservation Date:</strong> {moment(selectedEvent?.start).format('YYYY-MM-DD')}</p>
                  <p><strong>Check-In Date:</strong> {moment(selectedEvent?.start).format('YYYY-MM-DD HH:mm:ss')}</p>
                  <p><strong>Check-Out Date:</strong> {moment(selectedEvent?.end).format('YYYY-MM-DD HH:mm:ss')}</p>
                  <p><strong>Room Number:</strong> {selectedEvent?.room?.room_number || 'N/A'}</p>
                  <p><strong>Room:</strong> {selectedEvent?.room?.room_type_name || 'N/A'}</p>
                  <p><strong>Total Cost:</strong> ₱{selectedEvent?.room?.total_cost || 'N/A'}</p>
                  <p><strong>Breakfast:</strong> {selectedEvent?.room?.breakfast || 'None'}</p>
                </div>

                {/* Reservation Confirmation Section */}
                <div className="box">
                  <h2 className="title is-5">Reservation Confirmation</h2>
                  <div className="field">
                    <label className="label">Down Payment</label>
                    <div className="control">
                      <input className="input" type="number" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} />
                    </div>
                  </div>
                  <div className="field">
                    <label className="label">Confirm Reservation</label>
                    <div className="control">
                      <div className="select">
                        <select value={reservationStatus} onChange={(e) => handleChangeStatus(e.target.value)}>
                          <option value="CONFIRM">CONFIRM</option>
                          <option value="CANCEL">CANCEL</option>
                          <option value="PENDING">PENDING</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Show Cancellation Request only if CANCEL is chosen */}
                {reservationStatus === 'CANCEL' && (
                  <div className="box">
                    <h2 className="title is-5">Cancellation Request</h2>
                    <div className="field">
                      <label className="label">Cancellation Reason</label>
                      <div className="control">
                        <textarea className="textarea" value={cancellationRequest} onChange={(e) => setCancellationRequest(e.target.value)}></textarea>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
          <footer className="modal-card-foot">
            <button className="button is-success" onClick={() => console.log('Save Changes')}>Save Changes</button>
            <button className="button is-primary" onClick={handleCheckIn}>Check In</button>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default RoomReservationCalendar;
