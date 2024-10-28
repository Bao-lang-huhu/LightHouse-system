import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { Snackbar, Alert, Box, Typography, Button, TableContainer, TableBody, TableHead, TableCell, Table, TableRow, Select, MenuItem, TextField, TextareaAutosize } from '@mui/material';


const localizer = momentLocalizer(moment);

const EventReservationCalendar = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null); 
  const [showModal, setShowModal] = useState(false); 
  const [downPayment, setDownPayment] = useState(900);
  const [reservationStatus, setReservationStatus] = useState('CONFIRM');
  const [cancellationRequest, setCancellationRequest] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [notification, setNotification] = useState({
      open: false,
      message: '',
      severity: 'info', 
  });

  const handleCloseNotification = () => {
      setNotification({ ...notification, open: false });
  };

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
                start: new Date(startTime), 
                end: new Date(endTime),     
                status: reservation.event_status,
                guest: reservation.guest, 
                venue: reservation.venue, 
                foodPackage: reservation.foodPackage, 
                foodItems: reservation.foodItems, 
                event_total_price: reservation.event_total_price,  
                event_no_guest: reservation.event_no_guest,
                cancel_reservation_request: reservation.cancel_reservation_request // Make sure this is fetched
            };
        });
        
        setEvents(reservations);
    } catch (error) {
        console.error('Error fetching event reservations:', error);
        setNotification({
            open: true,
            message: 'Failed to load events. Please refresh the page.',
            severity: 'error',
        });
    } finally {
        setLoading(false); 
    }
};


  useEffect(() => {
    fetchEventReservations(); 
  }, [isSaved]);

  const handleCompleteEvent = async () => {
    try {
        await axios.put(`https://light-house-system-h74t-server.vercel.app/api/updateEventReservation/${selectedEvent.id}`, {
            reservationStatus: 'COMPLETED',
        });

        await fetchEventReservations(); // Refresh events list to ensure the calendar reflects the new status
        setShowModal(false); // Close the modal after the action

        // Show success notification
        setNotification({
            open: true,
            message: 'Event completed successfully!',
            severity: 'success',
        });
    } catch (error) {
        console.error('Error during event completion:', error);

        // Show error notification
        setNotification({
            open: true,
            message: 'Failed to complete the event. Please try again.',
            severity: 'error',
        });
    }
};

  const eventStyleGetter = (event) => {
    let backgroundColor;
  
    switch (event.status) {
      case 'CONFIRMED':
        backgroundColor = '#007bff'; // Blue for confirmed
        break;
      case 'CANCELED':
        backgroundColor = 'red'; // Red for canceled
        break;
      case 'COMPLETED':
        backgroundColor = '#17a2b8'; // Cyan for completed
        break;
      case 'NO SHOW':
        backgroundColor = '#6c757d'; // Grey for no show
        break;
      default:
        backgroundColor = '#007bff'; // Default to blue
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
    console.log(event); // Ensure this logs the full event object with all fields
    setSelectedEvent(event);  
    setDownPayment(event.downPayment || 0);
    setReservationStatus(event.status || 'CONFIRMED');
    setCancellationRequest(event.status === 'CANCELED' ? event.cancel_reservation_request || '' : ''); // Set cancellation reason if canceled
    setShowModal(true);      
};

  

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvent(null); 
  };

  const handleChangeStatus = (status) => {
    setReservationStatus(status);
    setIsSaved(false); // Ensure isSaved is false until the user explicitly saves the changes
  };

  const handleSaveChanges = async () => { 
    try {
        await axios.put(`https://light-house-system-h74t-server.vercel.app/api/updateEventReservation/${selectedEvent.id}`, {
            downPayment,
            reservationStatus,
            cancellationRequest: reservationStatus === 'CANCELED' ? cancellationRequest : null
        });
        setIsSaved(true); 
        await fetchEventReservations(); // Refresh the events list
        setShowModal(false); // Close the modal after saving changes

        setNotification({
            open: true,
            message: 'Changes saved successfully!',
            severity: 'success',
        });
    } catch (error) {
        console.error('Error saving changes:', error);
        setIsSaved(false); 

        // Show error notification
        setNotification({
            open: true,
            message: 'Failed to save changes. Please try again.',
            severity: 'error',
        });
    }
};

  return (
    <div style={{ margin: '20px' }}>
      {loading ? (
        <div className="loader-container" style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
          <ClipLoader color="#007bff" size={50} />
        </div>
      ) : (
        <>
         <Snackbar
            open={notification.open}
            autoHideDuration={3000}
            onClose={handleCloseNotification}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} 
            sx={{ width: '500px' }}>
            <Alert onClose={handleCloseNotification} severity={notification.severity}  style={{ fontSize: '1.2rem', padding: '20px' }} >
              {notification.message}
            </Alert>
         </Snackbar>

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
            <Typography variant="h6" mt={3}>Reservation Confirmation</Typography>

            <Box mb={1}>

              <Typography variant="body2" color="textSecondary">Payment</Typography>
              <TextField
                type="text" 
                value={downPayment}
                onChange={(e) => {
                  let value = e.target.value;
                  // Remove leading zeros
                  value = value.replace(/^0+(?=\d)/, '');

                  // Only allow positive numbers (including decimals if needed)
                  if (/^\d*\.?\d*$/.test(value)) {
                    setDownPayment(value);
                  }
                }}
                onBlur={() => {
                  // Convert to number on blur to prevent leading zero when editing is done
                  setDownPayment(Number(downPayment));
                }}
                variant="outlined"
                size="small"
                fullWidth
              />

            </Box>

            {reservationStatus !== 'COMPLETED' && (
                  <Box mb={1}>
                    <Typography variant="body2" color="textSecondary">Reservation Status</Typography>
                    <Select
                      value={reservationStatus}
                      onChange={(e) => handleChangeStatus(e.target.value)}
                      variant="outlined"
                      fullWidth
                    >
                      <MenuItem value="CONFIRMED">Confirm</MenuItem>
                      <MenuItem value="CANCELED">Cancel</MenuItem>
                    </Select>
                  </Box>
                )}

                {reservationStatus === 'CANCELED' && (
                  <Box mb={2}>
                    <Typography variant="h6" mb={1}>Cancellation Request:</Typography>
                    <Typography variant="body2" color="textSecondary">Cancellation Reason</Typography>
                    <TextareaAutosize
                      minRows={3}
                      value={cancellationRequest}
                      onChange={(e) => setCancellationRequest(e.target.value)}
                      style={{ width: '100%', padding: '8px' }}
                      placeholder="Enter the reason for cancellation"
                    />
                  </Box>
                )}


            </Box> 
          </Box>
                <Box display="flex" justifyContent="flex-end" mt={3}>
                    <Button variant="contained" color="primary" onClick={handleSaveChanges} sx={{ mr: 1 }}>Save Changes</Button>
                    
                    {/* Complete Event Button - Only show if the reservation is confirmed and no unsaved changes */}
                    {selectedEvent?.status === 'CONFIRMED' && reservationStatus === 'CONFIRMED' && isSaved && (
                        <Button variant="outlined" color="primary" onClick={handleCompleteEvent}>
                            COMPLETE EVENT
                        </Button>
                    )}
                </Box>
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
