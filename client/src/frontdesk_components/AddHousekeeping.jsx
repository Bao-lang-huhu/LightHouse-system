import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Table, Snackbar, Alert, FormControlLabel , Switch, TableBody, CircularProgress, TableCell, TableContainer, Box, TableHead, TableRow, Paper, Button, TextField, Typography , IconButton, TableFooter,
  Divider, InputAdornment,} from '@mui/material';
import 'bulma/css/bulma.min.css';
import '../App.css';
import { IoAdd, IoRemove } from 'react-icons/io5';
import AllHousekeepingRecordsModal from '../frontdesk_modals/AllHousekeepingRecordsModal';

const AddHousekeeping = () => {
    const [allRooms, setAllRooms] = useState([]);
    const [dirtyRooms, setDirtyRooms] = useState([]);
    const [housekeepingType, setHousekeepingType] = useState('General Cleaning');
    const [housekeepingNotes, setHousekeepingNotes] = useState('');
    const [roomNumber, setRoomNumber] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [staffId, setStaffId] = useState(null);
    const [selectedHousekeeping, setSelectedHousekeeping] = useState(null);
    const [isAllRecordsModalVisible, setIsAllRecordsModalVisible] = useState(false); // State for modal visibility
    const POLLING_INTERVAL = 5000; // Polling interval of 5 seconds
    const [notification, setNotification] = useState({
      open: false,
      message: '',
      severity: 'info', 
  });
  
    const handleCloseNotification = () => {
      setNotification({ ...notification, open: false });
    };
    
    
    const fetchRooms = async () => {
        try {
            const response = await axios.get('https://light-house-system-h74t-server.vercel.app/api/rooms');
            setAllRooms(response.data);
        } catch (error) {
            console.error('Error fetching all rooms:', error);
        }
    };

    // Fetch dirty rooms
    const fetchDirtyRooms = async () => {
        try {
            const response = await axios.get('https://light-house-system-h74t-server.vercel.app/api/dirty-rooms');
            setDirtyRooms(response.data);
        } catch (error) {
            console.error('Error fetching dirty rooms:', error);
        }
    };

    useEffect(() => {
        fetchRooms();
        fetchDirtyRooms();

        // Polling for real-time updates
        const interval = setInterval(() => {
            fetchRooms();
            fetchDirtyRooms();
        }, POLLING_INTERVAL);

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setStaffId(decoded.staff_id);
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        }
    }, []);

    const filteredRooms = allRooms.filter(
        room => !dirtyRooms.some(dirtyRoom => dirtyRoom.room_id === room.room_id)
    );

    const handleDirtyRoomClick = async (room) => {
        if (!room.housekeeping_id) {
            console.error("Housekeeping_id is missing for the selected room.");
            return;
        }
        try {
            const response = await axios.get(`https://light-house-system-h74t-server.vercel.app/api/housekeeping/${room.housekeeping_id}`);
            setSelectedHousekeeping(response.data);
        } catch (error) {
            console.error('Error fetching housekeeping details:', error);
        }
    };

  // Modified handleSaveChanges with notification
  const handleSaveChanges = async () => {
      if (!staffId) {
          setNotification({
              open: true,
              message: 'Failed to retrieve staff ID. Please log in again.',
              severity: 'error',
          });
          return;
      }
  
      try {
          const response = await axios.post('https://light-house-system-h74t-server.vercel.app/api/add-housekeeping', {
              housekeepingType,
              housekeepingNotes,
              roomNumber,
              staffId
          });
  
          setNotification({
              open: true,
              message: response.data.message || 'Housekeeping record saved successfully.',
              severity: 'success',
          });
          
          setHousekeepingNotes('');
          setRoomNumber('');
          fetchDirtyRooms();
          fetchRooms();
      } catch (error) {
          console.error('Error saving housekeeping data:', error);
          setNotification({
              open: true,
              message: 'Failed to save housekeeping data. Please try again.',
              severity: 'error',
          });
      }
  };
  
  // Modified handleCleaned with notification
  const handleCleaned = async () => {
      if (!selectedHousekeeping) return;
  
      try {
          await axios.put(`https://light-house-system-h74t-server.vercel.app/api/housekeeping/${selectedHousekeeping.housekeeping_id}/update`, {
              housekeeping_status: 'CLEANED',
              housekeeping_end: new Date().toISOString(),
          });
  
          setNotification({
              open: true,
              message: 'Room marked as cleaned!',
              severity: 'success',
          });
  
          setSelectedHousekeeping(null);
          fetchDirtyRooms();
          fetchRooms();
      } catch (error) {
          console.error('Error updating housekeeping status:', error);
          setNotification({
              open: true,
              message: 'Failed to mark room as cleaned. Please try again.',
              severity: 'error',
          });
      }
  };
  
  // Modified handleCancelHousekeeping with notification
  const handleCancelHousekeeping = async () => {
      if (!selectedHousekeeping) return;
  
      try {
          await axios.put(`https://light-house-system-h74t-server.vercel.app/api/housekeeping/${selectedHousekeeping.housekeeping_id}/update`, {
              housekeeping_status: null,
          });
  
          setNotification({
              open: true,
              message: 'Housekeeping canceled for this room!',
              severity: 'success',
          });
  
          setSelectedHousekeeping(null);
          fetchDirtyRooms();
          fetchRooms();
      } catch (error) {
          console.error('Error updating housekeeping status:', error);
          setNotification({
              open: true,
              message: 'Failed to cancel housekeeping. Please try again.',
              severity: 'error',
          });
      }
  };
  

    return (
        <section className="section-p1">
            <div className="columns">
              
                {/* Left Column: Available Rooms */}
                <div className="column is-3">
                    <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '20px' }}>
                    <Snackbar
                          open={notification.open}
                          autoHideDuration={3000}
                          onClose={handleCloseNotification}
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} 
                          sx={{ width: '500px' }}
                      >
                          <Alert onClose={handleCloseNotification} severity={notification.severity} style={{ fontSize: '1.2rem', padding: '20px' }}>
                              {notification.message}
                          </Alert>
                      </Snackbar>

                      <div style={{ flex: 1 }}>
                       
                      <div style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5em' }}>
                            <h1 className='subtitle' style={{ marginLeft: '25px', margin: 10 }}>
                                <strong>Housekeeping</strong>
                            </h1>
                            <AllHousekeepingRecordsModal
                            isVisible={isAllRecordsModalVisible}
                            className = "button is-blue is-fullwidth"
                            onClose={() => setIsAllRecordsModalVisible(false)}
                        />
                      </div>

                     <h4 className="label"><strong>Available Rooms for Cleaning</strong></h4>
                          <div className="container section-p1" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                              <div className="columns is-multiline is-mobile">
                              {filteredRooms.map((room) => (
                                  <div key={room.room_number} className="column is-12">
                                    
                                      <button
                                          className="button is-fullwidth"
                                          onClick={() => setRoomNumber(room.room_number)}
                                      >
                                          Room {room.room_number}
                                      </button>
                                  </div>
                              ))} </div>
                          </div>
                        </div>
                        <h4 className="label"><strong>Dirty Rooms</strong></h4>
                        <div className="container section-p1" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        <div className="columns is-multiline is-mobile">
                            {dirtyRooms.map((room) => (
                                <div key={room.room_number} className="column is-12">
                                    <button
                                        className="button is-fullwidth is-blue"
                                        onClick={() => handleDirtyRoomClick(room)}
                                    >
                                        Room {room.room_number}
                                    </button>
                                </div>
                            ))}
                            </div>
                        </div>

                        
                    </div>
                </div>

                {/* Right Column: Room Housekeeping Details */}
                <div className="column is-9">
                <Typography variant="h6" gutterBottom>
                  <strong>Add Housekeeping Record</strong>
                </Typography>
                    <div className="box">
                        <div className="columns">
                            <div className="column is-6">
                                <div className="field">
                                    <label className="label">Housekeeping Type</label>
                                    <div className="control">
                                        <input
                                            className="input"
                                            type="text"
                                            value={housekeepingType}
                                            onChange={(e) => setHousekeepingType(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="field">
                                    <label className="label">Housekeeping Notes</label>
                                    <div className="control">
                                        <textarea
                                            className="textarea"
                                            placeholder="Enter housekeeping notes here..."
                                            value={housekeepingNotes}
                                            onChange={(e) => setHousekeepingNotes(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="column is-6">
                                <div className="field">
                                    <label className="label">Room to Clean</label>
                                    <div className="control">
                                        <input
                                            className="input"
                                            type="text"
                                            placeholder="Enter Room Number"
                                            value={roomNumber}
                                            onChange={(e) => setRoomNumber(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleSaveChanges}
                          sx={{
                            fontSize: '1em',
                            padding: '10px 20px',
                            textTransform: 'none', // Keeps the button text from being uppercased
                            borderRadius: '8px',   // Rounds the button's corners slightly
                          }}
                        >
                          Save Changes
                        </Button>
                      </Box>
                        {successMessage && <p className="has-text-success">{successMessage}</p>}
                        {errorMessage && <p className="has-text-danger">{errorMessage}</p>}
                    </div>

                    {/* Dirty Room Details Box */}
                    <div className="box" style={{ marginTop: '20px' }}>
                    <Typography variant="h6" gutterBottom>
                  <strong>Dirty Room Details</strong>
                </Typography>
                        {selectedHousekeeping ? (
                            <div style={{ fontSize: '1.4em', lineHeight: '1.8em' }}>
                                <div className="columns">
                                    <div className="column is-half">
                                        <p className="is-size-5"><strong>Room Number:</strong> <span style={{ color: '#AAAAA' }}>{selectedHousekeeping.room_number}</span></p>
                                        <p className="is-size-5"><strong>Staff Name:</strong> <span style={{ color: '#AAAAA' }}>{selectedHousekeeping.staff_name || 'N/A'}</span></p>
                                        <p className="is-size-5"><strong>Housekeeping Notes:</strong> <span style={{ color: '#AAAAA' }}>{selectedHousekeeping.housekeeping_notes || 'No notes available'}</span></p>
                                    </div>
                                  
                                </div>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                                  <Button
                                    variant="contained"
                                    color="success"
                                    onClick={handleCleaned}
                                    sx={{
                                      fontSize: '0.8em',
                                      padding: '10px 15px',
                                      textTransform: 'none',
                                      borderRadius: '8px',
                                    }}
                                  >
                                    Cleaned
                                  </Button>
                                  
                                  <Button
                                    variant="contained"
                                    color="error"
                                    onClick={handleCancelHousekeeping}
                                    sx={{
                                      fontSize: '0.8em',
                                      padding: '10px 15px',
                                      textTransform: 'none',
                                      borderRadius: '8px',
                                    }}
                                  >
                                    Cancel Housekeeping
                                  </Button>
                                </Box>
                   
                            </div>
                        ) : (
                            <p style={{ fontSize: '1.2em' }}>Select a dirty room to view details.</p>
                        )}
                    </div>
                </div>
            </div>
          
                
       
           
        </section>
    );
};

export default AddHousekeeping;