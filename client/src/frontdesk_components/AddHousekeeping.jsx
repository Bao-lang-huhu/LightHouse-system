import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import 'bulma/css/bulma.min.css';
import '../App.css';
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

    // Fetch all rooms
    const fetchRooms = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/rooms');
            setAllRooms(response.data);
        } catch (error) {
            console.error('Error fetching all rooms:', error);
        }
    };

    // Fetch dirty rooms
    const fetchDirtyRooms = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/dirty-rooms');
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
            console.error("housekeeping_id is missing for the selected room.");
            return;
        }
        try {
            const response = await axios.get(`http://localhost:3001/api/housekeeping/${room.housekeeping_id}`);
            setSelectedHousekeeping(response.data);
        } catch (error) {
            console.error('Error fetching housekeeping details:', error);
        }
    };

    // Save housekeeping record
    const handleSaveChanges = async () => {
        if (!staffId) {
            setErrorMessage('Failed to retrieve staff ID. Please log in again.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:3001/api/add-housekeeping', {
                housekeepingType,
                housekeepingNotes,
                roomNumber,
                staffId
            });

            setSuccessMessage(response.data.message);
            setErrorMessage('');
            setHousekeepingNotes('');
            setRoomNumber('');

            // Immediately refresh dirty rooms list after adding
            fetchDirtyRooms();
            fetchRooms();
        } catch (error) {
            console.error('Error saving housekeeping data:', error);
            setSuccessMessage('');
            setErrorMessage('Failed to save housekeeping data. Please try again.');
        }
    };

    // Mark room as cleaned
    const handleCleaned = async () => {
        if (!selectedHousekeeping) return;

        try {
            await axios.put(`http://localhost:3001/api/housekeeping/${selectedHousekeeping.housekeeping_id}/update`, {
                housekeeping_status: 'CLEANED',
                housekeeping_end: new Date().toISOString(),
            });
            alert('Room marked as cleaned!');
            setSelectedHousekeeping(null);

            // Immediately refresh dirty rooms list after cleaning
            fetchDirtyRooms();
            fetchRooms();
        } catch (error) {
            console.error('Error updating housekeeping status:', error);
        }
    };

    // Cancel housekeeping
    const handleCancelHousekeeping = async () => {
        if (!selectedHousekeeping) return;

        try {
            await axios.put(`http://localhost:3001/api/housekeeping/${selectedHousekeeping.housekeeping_id}/update`, {
                housekeeping_status: null,
            });
            alert('Housekeeping canceled for this room!');
            setSelectedHousekeeping(null);

            // Immediately refresh dirty rooms list after canceling
            fetchDirtyRooms();
            fetchRooms();
        } catch (error) {
            console.error('Error updating housekeeping status:', error);
        }
    };

    return (
        <section className="section-p1">
            <div className="columns">
              
                {/* Left Column: Available Rooms */}
                <div className="column is-3">
                  
                    <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '20px' }}>
                        <h1 className="subtitle"><strong>HOUSEKEEPING</strong></h1>
                         {/* All Records Modal */}
                    <AllHousekeepingRecordsModal
                      isVisible={isAllRecordsModalVisible}
                      onClose={() => setIsAllRecordsModalVisible(false)}
                     /> <br></br>
                     <h3 className="subtitle"><strong>Available Rooms for Cleaning</strong></h3>
                        <h2 className="subtitle">All Rooms</h2>
                        
                        <div className="container section-p1" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                            {filteredRooms.map((room) => (
                                <div key={room.room_number}>
                                  
                                    <button
                                        className="button is-fullwidth"
                                        onClick={() => setRoomNumber(room.room_number)}
                                    >
                                        Room {room.room_number}
                                    </button>
                                </div>
                            ))}
                        </div>
                        
                        <h2 className="subtitle mt-4">Dirty Rooms</h2>
                        <div className="container section-p1" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                            {dirtyRooms.map((room) => (
                                <div key={room.room_number}>
                                    <button
                                        className="button is-fullwidth"
                                        style={{ backgroundColor: 'red', color: 'white' }}
                                        onClick={() => handleDirtyRoomClick(room)}
                                    >
                                        Room {room.room_number}
                                    </button>
                                </div>
                            ))}
                        </div>

                        
                    </div>
                </div>

                {/* Right Column: Room Housekeeping Details */}
                <div className="column is-9">
                    <h1 className="title">Add Housekeeping Record</h1>
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
                        <div className="buttons">
                            <button className="button is-primary" onClick={handleSaveChanges}>Save Changes</button>
                        </div>
                        {successMessage && <p className="has-text-success">{successMessage}</p>}
                        {errorMessage && <p className="has-text-danger">{errorMessage}</p>}
                    </div>

                    {/* Dirty Room Details Box */}
                    <div className="box" style={{ marginTop: '20px' }}>
                        <h2 className="title is-4" style={{ fontSize: '1.7em' }}>Dirty Room Details</h2>
                        {selectedHousekeeping ? (
                            <div style={{ fontSize: '1.4em', lineHeight: '1.8em' }}>
                                <div className="columns">
                                    <div className="column is-half">
                                        <p className="is-size-5"><strong>Room Number:</strong> <span style={{ color: '#AAAAA' }}>{selectedHousekeeping.room_number}</span></p>
                                        <p className="is-size-5"><strong>Staff ID:</strong> <span style={{ color: '#AAAAA' }}>{selectedHousekeeping.staff_id}</span></p>
                                        <p className="is-size-5"><strong>Staff Name:</strong> <span style={{ color: '#AAAAA' }}>{selectedHousekeeping.staff_name || 'N/A'}</span></p>
                                        <p className="is-size-5"><strong>Housekeeping Notes:</strong> <span style={{ color: '#AAAAA' }}>{selectedHousekeeping.housekeeping_notes || 'No notes available'}</span></p>
                                    </div>
                                    <div className="column is-half">
                                        <p className="is-size-5"><strong>Housekeeping ID:</strong> <span style={{ color: '#AAAAA' }}>{selectedHousekeeping.housekeeping_id}</span></p>
                                    </div>
                                </div>
                                <div className="buttons">
                                    <button className="button is-success" onClick={handleCleaned} style={{ fontSize: '.8em', padding: '10px 15px' }}>Cleaned</button>
                                    <button className="button is-danger" onClick={handleCancelHousekeeping} style={{ fontSize: '.8em', padding: '10px 15px' }}>Cancel Housekeeping</button>
                                </div>
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
