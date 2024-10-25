import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { Box, Typography, Button, TableContainer, TableBody, TableHead, TableCell, Table, TableRow, Select, MenuItem, TextField, TextareaAutosize } from '@mui/material';


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
      const response = await axios.get('http://localhost:3001/api/getEventReservationsAll');
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
            <div className="modal-card">
            <Box
          sx={{
            display: showModal ? 'block' : 'none',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            overflow: 'auto',
            zIndex: 1000,
          }}
            onClick={handleCloseModal}
          >
            <Box
        sx={{
          backgroundColor: 'white',
          margin: '5% auto',
          padding: 4,
          borderRadius: 2,
          maxWidth: 800,
          boxShadow: 24,
        }}
        onClick={(e) => e.stopPropagation()}
      >
            <Box display="flex" justifyContent="space-between" mb={3}>
              <Typography variant="h5">Event Reservation Details</Typography>
              <Button onClick={handleCloseModal}>X</Button>
            </Box>
            <Box display="flex" flexWrap="wrap">
          {/* Guest Information Section */}
          <Box flex="1" p={2}>
            <Typography variant="h6" mb={2}>Guest Information</Typography>
            <Box mb={1}>
              <Typography variant="body2" color="textSecondary">Name</Typography>
              <Typography variant="body1"><strong>{selectedEvent?.guest.guest_fname || 'N/A'} {selectedEvent?.guest.guest_lname || 'N/A'}</strong></Typography>
            </Box>
            <Box mb={1}>
              <Typography variant="body2" color="textSecondary">Gender</Typography>
              <Typography variant="body1"><strong>{selectedEvent?.guest.guest_gender || 'N/A'}</strong></Typography>
            </Box>
            <Box mb={1}>
              <Typography variant="body2" color="textSecondary">Email</Typography>
              <Typography variant="body1"><strong>{selectedEvent?.guest.guest_email || 'N/A'}</strong></Typography>
            </Box>
            <Box mb={1}>
              <Typography variant="body2" color="textSecondary">Address</Typography>
              <Typography variant="body1"><strong>{selectedEvent?.guest.guest_address || 'N/A'}</strong></Typography>
            </Box>
            <Box mb={1}>
              <Typography variant="body2" color="textSecondary">Country</Typography>
              <Typography variant="body1"><strong>{selectedEvent?.guest.guest_country || 'N/A'}</strong></Typography>
            </Box>
            <Box mb={1}>
              <Typography variant="body2" color="textSecondary">Contact Number</Typography>
              <Typography variant="body1"><strong>{selectedEvent?.guest.guest_phone_no || 'N/A'}</strong></Typography>
            </Box>
          </Box>

          {/* Reservation Information Section */}
          <Box flex="1" p={2}>
            <Typography variant="h6" mb={2}>Event Reservation Information</Typography>
            <Typography>Event Date:<strong> {moment(selectedEvent?.start).format('YYYY-MM-DD')}</strong></Typography>
            <Typography>Start Time: <strong>{moment(selectedEvent?.start).format('HH:mm')} to {moment(selectedEvent?.end).format('HH:mm')}</strong></Typography>
            <Typography>Venue:  <strong>{selectedEvent?.venue?.venue_name || 'No Venue'}</strong></Typography>
            <Typography>Total Cost: <strong>₱{selectedEvent?.event_total_price || 'N/A'}</strong></Typography>
            <Typography>No. of Guests: <strong>{selectedEvent?.event_no_guest || 'N/A'}</strong></Typography>
            <Typography variant="h6" gutterBottom>Food Items:</Typography>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Item</strong></TableCell>
                            <TableCell><strong>Category</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {selectedEvent?.foodItems?.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>{item.food_name}</TableCell>
                                <TableCell>{item.food_category_name}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
          </Box>
        </Box>
              <footer className="modal-card-foot">
                <button className="button is-success" onClick={() => console.log('Save Changes')}>Save Changes</button>
              </footer>
              </Box> 
              </Box>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EventReservationCalendar;
