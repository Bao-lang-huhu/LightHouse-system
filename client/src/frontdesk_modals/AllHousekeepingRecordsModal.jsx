import React, { useState } from 'react';
import axios from 'axios';
import 'bulma/css/bulma.min.css';
import '../App.css';

// Function to return color based on status
const getStatusColor = (status) => {
  if (status === 'CLEANED') return 'green';
  if (status === 'DIRTY') return 'red';
  return 'black';
};

// Modal component for displaying housekeeping records
const AllHousekeepingRecordsModal = ({ isVisible, onClose, records }) => {
  if (!isVisible) return null;

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal-content" style={{ width: '80%', maxHeight: '80vh', overflow: 'auto' }}>
        <span className="close" onClick={onClose} aria-label="Close modal">&times;</span>

        <div style={{ backgroundColor: 'white', borderRadius: '10px 10px 0 0', padding: '20px' }}>
          <h1 className="subtitle" style={{ fontSize: '25px' }}><strong>Housekeeping Records</strong></h1>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '0 0 10px 10px', padding: '20px', marginTop: '-35px' }}>
          <div className="table-container">
            <table className="table is-striped is-hoverable is-fullwidth">
              <thead>
                <tr>
                  <th style={{ backgroundColor: '#add8e6', fontSize: '18px' }}>Room Number</th>
                  <th style={{ backgroundColor: '#add8e6', fontSize: '18px' }}>Housekeeping Start</th>
                  <th style={{ backgroundColor: '#add8e6', fontSize: '18px' }}>Housekeeping End</th>
                  <th style={{ backgroundColor: '#add8e6', fontSize: '18px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.housekeeping_id} className="has-text-left">
                    <td>{record.room_number || 'N/A'}</td>
                    <td>{record.housekeeping_start || 'N/A'}</td>
                    <td>{record.housekeeping_end || 'NOT DONE'}</td>
                    <td style={{ color: getStatusColor(record.housekeeping_status) }}>
                      {record.housekeeping_status || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main component with "ALL RECORD" button
const HousekeepingComponent = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [records, setRecords] = useState([]);

  const fetchHousekeepingRecords = async () => {
    try {
      // Step 1: Fetch housekeeping records
      const housekeepingResponse = await axios.get('http://localhost:3001/api/housekeeping-records');

      // Step 2: Filter out records with null `room_id` and non-null `housekeeping_status`
      const housekeepingRecords = housekeepingResponse.data.filter(record => record.room_id && record.housekeeping_status);

      // Log the records after filtering
      console.log("Filtered Housekeeping Records (with valid room_id):", housekeepingRecords);

      // Step 3: Extract unique room_ids
      const roomIds = [...new Set(housekeepingRecords.map(record => record.room_id))];

      // Log the unique room IDs being fetched
      console.log("Unique Room IDs:", roomIds);

      if (roomIds.length === 0) {
        // If no room_ids, set records without room_number
        setRecords(housekeepingRecords);
        return;
      }

      // Step 4: Fetch room numbers for unique room_ids using the new endpoint
      const roomResponse = await axios.get('http://localhost:3001/api/room-numbers', {
        params: { room_ids: roomIds }
      });

      // Log room data response for debugging
      console.log("Room data response:", roomResponse.data);

      // Step 5: Create a mapping of room_id to room_number
      const roomMap = {};
      roomResponse.data.forEach(room => {
        roomMap[room.room_id] = room.room_number;
      });

      // Log roomMap for debugging
      console.log("Room Map:", roomMap);

      // Step 6: Map room_number to each housekeeping record
      const recordsWithRoomNumbers = housekeepingRecords.map(record => {
        const roomNumber = roomMap[record.room_id] || 'N/A';
        console.log(`Mapping room_id ${record.room_id} to room_number ${roomNumber}`);
        return {
          ...record,
          room_number: roomNumber
        };
      });

      // Step 7: Set the records with room numbers
      setRecords(recordsWithRoomNumbers);
    } catch (error) {
      console.error('Error fetching housekeeping records:', error);
    }
  };

  const handleAllRecordsClick = () => {
    fetchHousekeepingRecords(); // Fetch data when the button is clicked
    setIsModalVisible(true); // Show the modal
  };

  return (
    <div>
      <button className="button is-primary" onClick={handleAllRecordsClick}>ALL RECORD</button>

      <AllHousekeepingRecordsModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        records={records}
      />
    </div>
  );
};

export default HousekeepingComponent;