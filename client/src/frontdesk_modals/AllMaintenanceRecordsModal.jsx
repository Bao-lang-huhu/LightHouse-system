import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bulma/css/bulma.min.css';

// Function to return color based on maintenance status
const getStatusColor = (status) => {
    if (status === 'COMPLETE') return 'green';
    if (status === 'ONGOING') return 'orange';
    return 'black';
};

const AllMaintenanceRecordsModal = ({ isVisible, onClose }) => {
    const [maintenanceRecords, setMaintenanceRecords] = useState([]);

    useEffect(() => {
        if (isVisible) {
            fetchMaintenanceRecords();
        }
    }, [isVisible]);

    // Fetch all maintenance records (both ongoing and completed)
    const fetchMaintenanceRecords = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/maintenance-records');
            setMaintenanceRecords(response.data);
        } catch (error) {
            console.error('Error fetching maintenance records:', error);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="modal is-active">
            <div className="modal-background" onClick={onClose}></div>
            <div className="modal-content" style={{ width: '80%', maxHeight: '80vh', overflow: 'auto' }}>
                <span className="close" onClick={onClose} aria-label="Close modal">&times;</span>

                <div style={{ backgroundColor: 'white', borderRadius: '10px 10px 0 0', padding: '20px' }}>
                    <h1 className="subtitle" style={{ fontSize: '25px', fontWeight: 'bold' }}>Maintenance Records</h1>
                </div>

                <div style={{ backgroundColor: 'white', borderRadius: '0 0 10px 10px', padding: '20px', marginTop: '-35px' }}>
                    <div className="table-container">
                        <table className="table is-striped is-hoverable is-fullwidth">
                            <thead>
                                <tr>
                                    <th style={{ backgroundColor: '#add8e6', fontSize: '18px' }}>Room Number</th>
                                    <th style={{ backgroundColor: '#add8e6', fontSize: '18px' }}>Type</th>
                                    <th style={{ backgroundColor: '#add8e6', fontSize: '18px' }}>Status</th>
                                    <th style={{ backgroundColor: '#add8e6', fontSize: '18px' }}>Notes</th>
                                    <th style={{ backgroundColor: '#add8e6', fontSize: '18px' }}>Start Time</th>
                                    <th style={{ backgroundColor: '#add8e6', fontSize: '18px' }}>End Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {maintenanceRecords.map((record) => (
                                    <tr key={record.maintenance_id}>
                                        <td>{record.room_number || 'N/A'}</td>
                                        <td>{record.maintenance_type || 'N/A'}</td>
                                        <td style={{ color: getStatusColor(record.maintenance_status) }}>
                                            {record.maintenance_status || 'N/A'}
                                        </td>
                                        <td>{record.maintenance_notes || 'No notes available'}</td>
                                        <td>{new Date(record.maintenance_date_time_start).toLocaleString()}</td>
                                        <td>{record.maintenance_date_time_end ? new Date(record.maintenance_date_time_end).toLocaleString() : 'Ongoing'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <button className="modal-close is-large" aria-label="close" onClick={onClose}></button>
        </div>
    );
};

export default AllMaintenanceRecordsModal;
