import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';

const localizer = momentLocalizer(moment);

const EventReservationCalendar = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null); 
  const [showModal, setShowModal] = useState(false); 
  const [downPayment, setDownPayment] = useState(900);
  const [reservationStatus, setReservationStatus] = useState('CONFIRM');
  const [cancellationRequest, setCancellationRequest] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch event reservations
  const fetchEventReservations = async () => {
    try {
      const response = await axios.get('https://light-house-system-h74t-server.vercel.app/api/getEventReservationsAll');
      const reservations = response.data.map(reservation => {
        const startTime = `${reservation.event_date}T${reservation.event_start_time}`;
        const endTime = `${reservation.event_date}T${reservation.event_end_time}`;
      
        return {
          id: reservation.event_reservation_id,
          title: reservation.event_name 
            ? `${reservation.event_name} (${reservation.guest.guest_fname} ${reservation.guest.guest_lname})`
            : 'Event Reservation',
          start: new Date(startTime), // Combine event_date and event_start_time
          end: new Date(endTime),     // Combine event_date and event_end_time
          status: reservation.event_status,
          guest: reservation.guest, 
          venue: reservation.venue, 
          foodPackage: reservation.foodPackage, 
          foodItems: reservation.foodItems, 
          event_total_price: reservation.event_total_price,  
          event_no_guest: reservation.event_no_guest 
        };
      });
      
      setEvents(reservations);
    } catch (error) {
      console.error('Error fetching event reservations:', error);
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchEventReservations(); 
  }, []);

  const eventStyleGetter = (event) => {
    let backgroundColor = '#007bff'; 

    switch (event.status) {
      case 'CONFIRMED':
        backgroundColor = '#007bff'; 
        break;
      case 'CANCELED':
        backgroundColor = 'red'; 
        break;
      case 'COMPLETED':
        backgroundColor = '#17a2b8'; 
        break;
      case 'NO SHOW':
        backgroundColor = '#6c757d'; 
        break;
      default:
        backgroundColor = '#007bff'; 
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


  const handleEventClick = (event) => {
    console.log(event); // Ensure this logs the full event object with all fields, including event_total_price and event_no_guest
    setSelectedEvent(event);  // Set the selected event
    setShowModal(true);       // Show the modal
  };
  

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvent(null); 
  };

  return (
    <div style={{ margin: '20px' }}>
      {loading ? (
        <div className="loader-container" style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
          <ClipLoader color="#007bff" size={50} />
        </div>
      ) : (
        <>
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

          {/* Calendar */}
          <div style={{ height: '600px' }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              defaultView="month"
              style={{ height: 600 }}
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
                  <div className="column is-half">
                    <div className="box">
                      <h2 className="title is-5">Guest Information</h2>
                      <p><strong>First Name:</strong> {selectedEvent?.guest?.guest_fname || 'N/A'}</p>
                      <p><strong>Last Name:</strong> {selectedEvent?.guest?.guest_lname || 'N/A'}</p>
                      <p><strong>Email:</strong> {selectedEvent?.guest?.guest_email || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="column is-half">
                    <div className="box">
                      <h2 className="title is-5">Reservation Information</h2>
                      <p><strong>Event Date:</strong> {moment(selectedEvent?.start).format('YYYY-MM-DD')}</p>
                      <p><strong>Start Time:</strong> {moment(selectedEvent?.start).format('HH:mm')}</p>
                      <p><strong>End Time:</strong> {moment(selectedEvent?.end).format('HH:mm')}</p>
                      <p><strong>Venue:</strong> {selectedEvent?.venue?.venue_name || 'N/A'}</p>
                      <p><strong>Total Cost:</strong> ₱{selectedEvent?.event_total_price || 'N/A'}</p>
                      <p><strong>No. of Guests:</strong> {selectedEvent?.event_no_guest || 'N/A'}</p>
                      <p><strong>Total Cost:</strong> ₱{selectedEvent?.event_total_price || 'N/A'}</p>
                      <p><strong>Food Items:</strong></p>
                      <table className="table is-striped is-fullwidth">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Category</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedEvent?.foodItems?.map((item, index) => (
                            <tr key={index}>
                              <td>{item.food_name}</td>
                              <td>{item.food_category_name}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>
              <footer className="modal-card-foot">
                <button className="button is-success" onClick={() => console.log('Save Changes')}>Save Changes</button>
              </footer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EventReservationCalendar;
