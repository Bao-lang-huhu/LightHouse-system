import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
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

    const handleSaveChanges = async () => {
        if (!staffId) {
            setErrorMessage('Failed to retrieve staff ID. Please log in again.');
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

            setSuccessMessage(response.data.message);
            setErrorMessage('');
            setMaintenanceType('');
            setMaintenanceName('');
            setMaintenanceNotes('');
            setRoomNumber('');
            fetchMaintenanceRooms();
            fetchRooms();
        } catch (error) {
            console.error('Error saving maintenance data:', error);
            setSuccessMessage('');
            setErrorMessage('Failed to save maintenance data. Please try again.');
        }
    };

    const handleMaintenanceRoomClick = async (room) => {
        if (!room.maintenance_id) {
            console.error("maintenance_id is missing for the selected room.");
            return;
        }
        try {
            const response = await axios.get(`https://light-house-system-h74t-server.vercel.app/api/maintenance/${room.maintenance_id}`);
            setSelectedMaintenance(response.data); // Set the fetched maintenance details
        } catch (error) {
            console.error('Error fetching maintenance details:', error);
        }
    };

    const handleMarkAsCompleted = async () => {
        if (!selectedMaintenance) return;

        try {
            await axios.put(`https://light-house-system-h74t-server.vercel.app/api/maintenance/${selectedMaintenance.maintenance_id}/completed`, {
                maintenance_date_time_end: new Date().toISOString(),
            });
            alert('Maintenance marked as completed!');
            setSelectedMaintenance(null);
            fetchMaintenanceRooms();
        } catch (error) {
            console.error('Error updating maintenance status:', error);
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
                        <h1 className="subtitle has-text-centered" style={{ fontSize: '24px', fontWeight: 'bold', color: '#4a4a4a' }}>MAINTENANCE</h1>
                        <button
                            className="button is-info is-fullwidth"
                            style={{
                                fontSize: '16px',
                                padding: '15px',
                                fontWeight: 'bold',
                                borderRadius: '8px',
                                boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
                                marginTop: '15px',
                                backgroundColor: '#209cee',
                                color: '#ffffff'
                            }}
                            onClick={() => setIsAllRecordsModalVisible(true)}
                        >
                            Maintenance Records
                        </button>
                        <AllMaintenanceRecordsModal
                            isVisible={isAllRecordsModalVisible}
                            onClose={() => setIsAllRecordsModalVisible(false)}
                        />
                        <h3 className="subtitle"><strong>Available Rooms</strong></h3>
                        <div className="container section-p1" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                            {availableRooms.map((room) => (
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

                        <h2 className="subtitle mt-4">Rooms Needing Maintenance</h2>
                        <div className="container section-p1" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                            {maintenanceRooms.map((room) => (
                                <div key={room.room_number}>
                                    <button
                                        className="button is-fullwidth"
                                        style={{ backgroundColor: 'orange', color: 'white' }}
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
                    <h1 className="title">Add Maintenance Record</h1>
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
                        <div className="buttons">
                            <button className="button is-primary" onClick={handleSaveChanges}>Save Changes</button>
                        </div>
                        {successMessage && <p className="has-text-success">{successMessage}</p>}
                        {errorMessage && <p className="has-text-danger">{errorMessage}</p>}
                    </div>

                    {/* Maintenance Room Details Box */}
                    <div className="box" style={{ marginTop: '20px' }}>
                        <h2 className="title is-4" style={{ fontSize: '1.7em' }}>Maintenance Room Details</h2>
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
                                <div className="buttons">
                                    <button className="button is-success" onClick={handleMarkAsCompleted} style={{ fontSize: '.8em', padding: '10px 15px' }}>Mark as Completed</button>
                                    <button className="button is-danger" onClick={handleCancelMaintenance} style={{ fontSize: '.8em', padding: '10px 15px' }}>Cancel Maintenance</button>
                                </div>
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