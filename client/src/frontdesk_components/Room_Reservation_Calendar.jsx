import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import { ClipLoader } from 'react-spinners'; // Import the ClipLoader
import { jwtDecode } from 'jwt-decode';
import { Box, Typography, Button, Select, MenuItem, TextField, TextareaAutosize } from '@mui/material';

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
        room: reservation.room     
      }));
      setEvents(reservations);
    } catch (error) {
      console.error('Error fetching room reservations:', error);
    } finally {
      setLoading(false); // Stop loading once data is fetched or error occurs
    }
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

  const handleEventClick = (event) => {
    console.log("Selected Event:", event); // Check the event data
    console.log("Down Payment:", event.downPayment); // Verify down payment
    setSelectedEvent(event);
    setDownPayment(event.downPayment || 0);
    setReservationStatus(event.status || 'CONFIRMED');
    setShowModal(true);      
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
        setShowModal(false); // Close the modal after the action
    } catch (error) {
        console.error('Error during check-in:', error);
    }
};

useEffect(() => {
  fetchRoomReservations();
}, [isSaved]); // Add isSaved as a dependency to refresh whenever changes are confirmed


  
const handleSaveChanges = async () => {
  try {
      await axios.put(`http://localhost:3001/api/updateRoomReservation/${selectedEvent.id}`, {
          downPayment,
          reservationStatus,
          cancellationRequest: reservationStatus === 'CANCELED' ? cancellationRequest : null
      });

      // Update isSaved and fetch reservations after a successful save
      setIsSaved(true); 
      await fetchRoomReservations(); 
      setShowModal(false); 
  } catch (error) {
      console.error('Error saving changes:', error);
      setIsSaved(false); // Ensure isSaved remains false if there was an error
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
          <Typography variant="h5">Reservation Details</Typography>
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
                  type="number"
                  variant="outlined"
                  size="small"
                  value={downPayment}
                  onChange={(e) => {
                      const value = e.target.value;
                      // Only allow positive numbers
                      if (/^\d*\.?\d*$/.test(value)) {
                          setDownPayment(Number(value));
                      }
                  }}
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

            {/* Cancellation Request Section */}
            {reservationStatus === 'CANCELED' && (
              <Box mb={2}>
                <Typography variant="h6" mb={1}>Cancellation Request</Typography>
                <Typography variant="body2" color="textSecondary">Cancellation Reason</Typography>
                <TextareaAutosize
                  minRows={3}
                  value={cancellationRequest}
                  onChange={(e) => setCancellationRequest(e.target.value)}
                  style={{ width: '100%', padding: '8px' }}
                />
              </Box>
            )}
          </Box>
        </Box>
     
        <Box display="flex" justifyContent="flex-end" mt={3}>
    <Button variant="contained" color="primary" onClick={handleSaveChanges} sx={{ mr: 1 }}>Save Changes</Button>
    
    {/* Check In Button - Only show if the database status is confirmed and no unsaved changes */}
    {(selectedEvent?.status === 'CONFIRMED' && reservationStatus === 'CONFIRMED' && isSaved) && (
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
