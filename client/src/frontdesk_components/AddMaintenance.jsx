import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Table, Snackbar, Alert, FormControlLabel , Switch, TableBody, CircularProgress, TableCell, TableContainer, Box, TableHead, TableRow, Paper, Button, TextField, Typography , IconButton, TableFooter,
  Divider, InputAdornment,} from '@mui/material';
import 'bulma/css/bulma.min.css';
import '../App.css';
import AllMaintenanceRecordsModal from '../frontdesk_modals/AllMaintenanceRecordsModal';

const AddMaintenance = () => {
    const [allRooms, setAllRooms] = useState([]);
    const [maintenanceRooms, setMaintenanceRooms] = useState([]); // Rooms needing maintenance
    const [availableRooms, setAvailableRooms] = useState([]); // Filtered available rooms without ongoing maintenance
    const [maintenanceType, setMaintenanceType] = useState('General Maintenance');
    const [maintenanceName, setMaintenanceName] = useState('');
    const [maintenanceNotes, setMaintenanceNotes] = useState('');
    const [roomNumber, setRoomNumber] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [staffId, setStaffId] = useState(null);
    const [selectedMaintenance, setSelectedMaintenance] = useState(null); // Selected maintenance details
    const [isAllRecordsModalVisible, setIsAllRecordsModalVisible] = useState(false);
    const POLLING_INTERVAL = 5000;
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

    const fetchMaintenanceRooms = async () => {
        try {
            const response = await axios.get('https://light-house-system-h74t-server.vercel.app/api/maintenance-rooms');
            const ongoingMaintenanceRooms = response.data.filter(room => room.maintenance_status === 'ONGOING');
            setMaintenanceRooms(ongoingMaintenanceRooms);
        } catch (error) {
            console.error('Error fetching maintenance rooms:', error);
        }
    };

    useEffect(() => {
        const filterAvailableRooms = () => {
            const ongoingRoomIds = maintenanceRooms.map(room => room.room_id);
            const filteredRooms = allRooms.filter(room => !ongoingRoomIds.includes(room.room_id));
            setAvailableRooms(filteredRooms);
        };
        filterAvailableRooms();
    }, [allRooms, maintenanceRooms]);

    useEffect(() => {
        fetchRooms();
        fetchMaintenanceRooms();

        const interval = setInterval(() => {
            fetchRooms();
            fetchMaintenanceRooms();
        }, POLLING_INTERVAL);

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
          const response = await axios.post('https://light-house-system-h74t-server.vercel.app/api/add-maintenance', {
              maintenanceType,
              maintenanceName,
              maintenanceNotes,
              roomNumber,
              startTime: new Date().toISOString(),
              staffId,
          });
  
          setNotification({
              open: true,
              message: response.data.message || 'Maintenance record saved successfully.',
              severity: 'success',
          });
  
          setMaintenanceType('');
          setMaintenanceName('');
          setMaintenanceNotes('');
          setRoomNumber('');
          fetchMaintenanceRooms();
          fetchRooms();
      } catch (error) {
          console.error('Error saving maintenance data:', error);
          setNotification({
              open: true,
              message: 'Failed to save maintenance data. Please try again.',
              severity: 'error',
          });
      }
  };
  
  // Modified handleMaintenanceRoomClick (no notification needed but can be added for feedback)
  const handleMaintenanceRoomClick = async (room) => {
      if (!room.maintenance_id) {
          console.error("maintenance_id is missing for the selected room.");
          return;
      }
      try {
          const response = await axios.get(`https://light-house-system-h74t-server.vercel.app/api/maintenance/${room.maintenance_id}`);
          setSelectedMaintenance(response.data);
      } catch (error) {
          console.error('Error fetching maintenance details:', error);
          setNotification({
              open: true,
              message: 'Failed to fetch maintenance details.',
              severity: 'error',
          });
      }
  };
  
  // Modified handleMarkAsCompleted with notification
  const handleMarkAsCompleted = async () => {
      if (!selectedMaintenance) return;
  
      try {
          await axios.put(`https://light-house-system-h74t-server.vercel.app/api/maintenance/${selectedMaintenance.maintenance_id}/completed`, {
              maintenance_date_time_end: new Date().toISOString(),
          });
  
          setNotification({
              open: true,
              message: 'Maintenance marked as completed!',
              severity: 'success',
          });
  
          setSelectedMaintenance(null);
          fetchMaintenanceRooms();
      } catch (error) {
          console.error('Error updating maintenance status:', error);
          setNotification({
              open: true,
              message: 'Failed to mark maintenance as completed. Please try again.',
              severity: 'error',
          });
      }
  };
  

    const handleCancelMaintenance = async () => {
        if (!selectedMaintenance) return;

        try {
            await axios.put(`https://light-house-system-h74t-server.vercel.app/api/maintenance/${selectedMaintenance.maintenance_id}/cancel`, {
                maintenance_status: 'CANCELED',
            });
            alert('Maintenance has been canceled.');
            setSelectedMaintenance(null);
            fetchMaintenanceRooms();
        } catch (error) {
            console.error('Error canceling maintenance:', error);
        }
    };

    return (
        <section className="section-p1">
            <div className="columns">
                {/* Left Column: Available Rooms */}
                <div className="column is-3">
                    <div style={{ backgroundColor: '#f5f5f5', borderRadius: '10px', padding: '20px', boxShadow: '0px 4px 8px rgba(0,0,0,0.1)' }}>
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
                      <div style={{flex: 1}}>
                      <div style={{ justifyContent: 'space-between', alignItems: 'center' }}>

                        <h1 className='subtitle' style={{ marginLeft: '25px', margin: 18 }}>
                          <strong>Maintenance</strong>
                        </h1>

                        <button
                            className="button is-info is-fullwidth"
                            style={{
                                fontSize: '16px',
                                padding: '0.5rem',
                                margin: '0.5rem',
                                fontWeight: 'bold',
                                borderRadius: '8px',
                                boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
                                marginTop: '15px',
                                backgroundColor: '#209cee',
                                color: '#ffffff'
                            }}
                            onClick={() => setIsAllRecordsModalVisible(true)}
                        >
                           ALL RECORDS
                        </button>
                        <AllMaintenanceRecordsModal
                            isVisible={isAllRecordsModalVisible}
                            onClose={() => setIsAllRecordsModalVisible(false)}
                        />

                        </div>


                      </div>
                        
                      <h4 className="label"><strong>Available Rooms</strong></h4>
                      <div className="container section-p1" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        <div className="columns is-multiline is-mobile">
                        {availableRooms.map((room) => (
                                <div key={room.room_number} className="column is-12">
                                    <button
                                        className="button is-fullwidth"
                                        onClick={() => setRoomNumber(room.room_number)}
                                    >
                                        Room {room.room_number}
                                    </button>
                                </div>
                            ))}
                              </div>
                        </div>
                        <h4 className="label"><strong>Rooms Needing Maintenance</strong></h4>
                        <div className="container section-p1" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                            {maintenanceRooms.map((room) => (
                                <div key={room.room_number}>
                                    <button
                                        className="button is-fullwidth is-blue"
                                        onClick={() => handleMaintenanceRoomClick(room)}
                                    >
                                        Room {room.room_number}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                 {/* Right Column: Maintenance Details */}
                 <div className="column is-9">
                 <Typography variant="h6" gutterBottom>
                  <strong>Add Maintenance Record</strong>
                </Typography>
                    <div className="box">
                        <div className="columns">
                            <div className="column is-6">
                                <div className="field">
                                    <label className="label">Maintenance Type</label>
                                    <div className="control">
                                        <input
                                            className="input"
                                            type="text"
                                            placeholder="Enter maintenance type"
                                            value={maintenanceType}
                                            onChange={(e) => setMaintenanceType(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="field">
                                    <label className="label">Maintenance Name</label>
                                    <div className="control">
                                        <input
                                            className="input"
                                            type="text"
                                            placeholder="Enter maintenance name"
                                            value={maintenanceName}
                                            onChange={(e) => setMaintenanceName(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="field">
                                    <label className="label">Maintenance Notes</label>
                                    <div className="control">
                                        <textarea
                                            className="textarea"
                                            placeholder="Enter maintenance notes here..."
                                            value={maintenanceNotes}
                                            onChange={(e) => setMaintenanceNotes(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="column is-6">
                                <div className="field">
                                    <label className="label">Room Number</label>
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

                    {/* Maintenance Room Details Box */}
                    <div className="box" style={{ marginTop: '20px' }}>
                    <Typography variant="h6" gutterBottom>
                      <strong>Maintenance Room Details</strong>
                    </Typography>
                        {selectedMaintenance ? (
                            <div style={{ fontSize: '1.4em', lineHeight: '1.8em' }}>
                                <div className="columns">
                                    <div className="column is-half">
                                        <p className="is-size-5"><strong>Room Number:</strong> <span style={{ color: '#AAAAA' }}>{selectedMaintenance.room_number}</span></p>
                                        <p className="is-size-5"><strong>Staff ID:</strong> <span style={{ color: '#AAAAA' }}>{selectedMaintenance.staff_id}</span></p>
                                        <p className="is-size-5"><strong>Staff Name:</strong> <span style={{ color: '#AAAAA' }}>{selectedMaintenance.staff_name || 'N/A'}</span></p>
                                        <p className="is-size-5"><strong>Maintenance Notes:</strong> <span style={{ color: '#AAAAA' }}>{selectedMaintenance.maintenance_notes || 'No notes available'}</span></p>
                                    </div>
                                    <div className="column is-half">
                                        <p className="is-size-5"><strong>Maintenance ID:</strong> <span style={{ color: '#AAAAA' }}>{selectedMaintenance.maintenance_id}</span></p>
                                    </div>
                                </div>
                          
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                                  <Button
                                    variant="contained"
                                    color="success"
                                    onClick={handleMarkAsCompleted}
                                    sx={{
                                      fontSize: '0.8em',
                                      padding: '10px 15px',
                                      textTransform: 'none',
                                      borderRadius: '8px',
                                    }}
                                  >
                                    Completed
                                  </Button>
                                  
                                  <Button
                                    variant="contained"
                                    color="error"
                                    onClick={handleCancelMaintenance}
                                    sx={{
                                      fontSize: '0.8em',
                                      padding: '10px 15px',
                                      textTransform: 'none',
                                      borderRadius: '8px',
                                    }}
                                  >
                                    Cancel Maintenance
                                  </Button>
                                </Box>
                            </div>
                        ) : (
                            <p style={{ fontSize: '1.2em' }}>Select a room needing maintenance to view details.</p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AddMaintenance;