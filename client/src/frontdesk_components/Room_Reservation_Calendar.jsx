import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import { ClipLoader } from 'react-spinners'; // Import the ClipLoader
import { jwtDecode } from 'jwt-decode';
import { Snackbar,  Alert, Box, Typography, Button, Select, MenuItem, TextField, TextareaAutosize } from '@mui/material';

const localizer = momentLocalizer(moment);

const RoomReservationCalendar = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null); 
  const [showModal, setShowModal] = useState(false); 
  const [downPayment, setDownPayment] = useState([]);
  const [reservationStatus, setReservationStatus] = useState('CONFIRMED');
  const [cancellationRequest, setCancellationRequest] = useState('');
  const [loading, setLoading] = useState(true); // Keep the loading state
  const [isSaved, setIsSaved] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info', 
});
  const fetchRoomReservations = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/getRoomReservationsAll');
      const reservations = response.data.map(reservation => ({
        id: reservation.room_reservation_id,
        title: reservation.room 
          ? `Room Reserved - Room ${reservation.room.room_number} (${reservation.guest.guest_fname} ${reservation.guest.guest_lname})`
          : 'Room Reservation',
        start: new Date(reservation.room_check_in_date),
        end: new Date(reservation.room_check_out_date),
        downPayment: reservation.room_downpayment, 
        status: reservation.reservation_status,
        guest: reservation.guest,
        room: reservation.room,
        cancel_reservation_request: reservation.cancel_reservation_request // Make sure this is fetched    
      }));
      setEvents(reservations);
    } catch (error) {
      console.error('Error fetching room reservations:', error);
      setNotification({
        open: true,
        message: 'Failed to load events. Please refresh the page.',
        severity: 'error',
    });
    } finally {
      setLoading(false); // Stop loading once data is fetched or error occurs
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
};

  useEffect(() => {
    fetchRoomReservations();
}, [isSaved]); // Ensure it fetches data whenever the state changes

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

  // Add this function to check and set the saved status based on the database value.
const setInitialSavedStatus = (event) => {
  // Set isSaved to true if the reservation is already CONFIRMED
  setIsSaved(event.status === 'CONFIRMED');
};

const handleEventClick = (event) => {
  setSelectedEvent(event);
  setDownPayment(event.downPayment || 0);
  setReservationStatus(event.status || 'CONFIRMED');
  setCancellationRequest(event.status === 'CANCELED' ? event.cancel_reservation_request || 'No reason provided.' : '');
  setShowModal(true);
  
  // Set isSaved based on the initial status of the event
  setInitialSavedStatus(event);
};




  

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvent(null); 
  };

  const handleCheckIn = async () => {
    try {
        const token = localStorage.getItem('token'); // Assuming you store JWT in local storage
        const decodedToken = jwtDecode(token);
        const staff_id = decodedToken.staff_id;
    
        await axios.put(`http://localhost:3001/api/updateRoomReservation/${selectedEvent.id}`, {
            reservationStatus: 'COMPLETED',
            staff_id: staff_id
        });

        await fetchRoomReservations(); // Refresh events list to ensure the calendar reflects the new status
        setShowModal(false); 
        setNotification({
          open: true,
          message: 'Guest is checked-in!',
          severity: 'success',
      });// Close the modal after the action
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to complete. Please try again.',
        severity: 'error',
    });
    }
};

  
const handleSaveChanges = async () => {
  try {
      await axios.put(`http://localhost:3001/api/updateRoomReservation/${selectedEvent.id}`, {
          downPayment,
          reservationStatus,
          cancellationRequest: reservationStatus === 'CANCELED' ? cancellationRequest : null
      });

      setIsSaved(true); 
      await fetchRoomReservations(); 
      setShowModal(false); 
      setNotification({
        open: true,
        message: 'Changes saved successfully!',
        severity: 'success',
    });
  } catch (error) {
      console.error('Error saving changes:', error);
      setIsSaved(false); 
      setNotification({
        open: true,
        message: 'Failed to save changes. Please try again.',
        severity: 'error',
    });// Ensure isSaved remains false if there was an error
  }
};

const handleChangeStatus = (status) => {
  setReservationStatus(status);
  setIsSaved(false); // Ensure isSaved is false until the user explicitly saves the changes
};


  return (
    <div style={{ margin: '20px' }}>
      {/* Show loader while data is being fetched */}
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

      <div style={{ height: '500px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView="month"
          style={{ height: 700 }}
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
          <Typography variant="h5">Room Reservation Details</Typography>
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
            <Typography variant="h6" mb={2}>Reservation Information</Typography>
            <Box mb={1}>
              <Typography variant="body2" color="textSecondary">Reservation Date</Typography>
              <Typography variant="body1"><strong>{moment(selectedEvent?.start).format('YYYY-MM-DD')}</strong></Typography>
            </Box>
            <Box mb={1}>
              <Typography variant="body2" color="textSecondary">Check-In Date</Typography>
              <Typography variant="body1"><strong>{moment(selectedEvent?.start).format('YYYY-MM-DD HH:mm:ss')}</strong></Typography>
            </Box>
            <Box mb={1}>
              <Typography variant="body2" color="textSecondary">Check-Out Date</Typography>
              <Typography variant="body1"><strong>{moment(selectedEvent?.end).format('YYYY-MM-DD HH:mm:ss')}</strong></Typography>
            </Box>
            <Box mb={1}>
              <Typography variant="body2" color="textSecondary">Room Number</Typography>
              <Typography variant="body1"><strong>{selectedEvent?.room?.room_number || 'N/A'}</strong></Typography>
            </Box>
            <Box mb={1}>
              <Typography variant="body2" color="textSecondary">Room</Typography>
              <Typography variant="body1"><strong>{selectedEvent?.room?.room_type_name || 'N/A'}</strong></Typography>
            </Box>
            <Box mb={1}>
              <Typography variant="body2" color="textSecondary">Total Cost</Typography>
              <Typography variant="body1"><strong>₱{selectedEvent?.room?.total_cost || 'N/A'}</strong></Typography>
            </Box>
            <Box mb={1}>
              <Typography variant="body2" color="textSecondary">Breakfast</Typography>
              <Typography variant="body1"><strong>{selectedEvent?.room?.breakfast || 'None'}</strong></Typography>
            </Box>

            {/* Reservation Confirmation Section */}
            <Typography variant="h6" mt={3}>Reservation Confirmation</Typography>
            <Box mb={1}>
              <Typography variant="body2" color="textSecondary">Down Payment</Typography>
              <TextField
                type="text" // Use 'text' type instead of 'number' to better control input formatting
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
                <Typography variant="body2" color="textSecondary">Confirm Reservation</Typography>
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
      
      {/* Show Check In button if the reservation status is CONFIRMED */}
      {selectedEvent?.status === 'CONFIRMED' && reservationStatus === 'CONFIRMED' && (
        <Button variant="outlined" color="inverted" onClick={handleCheckIn}>
          Check In
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

export default RoomReservationCalendar;
