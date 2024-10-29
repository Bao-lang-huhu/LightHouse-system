import React, { useState } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, Typography, Dialog, TablePagination
} from '@mui/material';
import 'bulma/css/bulma.min.css';
import '../App.css';

const getStatusColor = (status) => {
  if (status === 'CLEANED') return 'green';
  if (status === 'DIRTY') return 'red';
  return 'black';
};

const AllHousekeepingRecordsModal = ({ isVisible, onClose, records }) => {
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const handlePageChange = (event, newPage) => setPage(newPage);

  if (!isVisible) return null;

  return (
    <Dialog open={isVisible} onClose={onClose} fullWidth maxWidth="md">
      <div style={{ padding: '20px' }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Housekeeping Records
        </Typography>

        <TableContainer component={Paper} style={{ maxHeight: '400px' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell style={{ backgroundColor: '#add8e6' }}>Room Number</TableCell>
                <TableCell style={{ backgroundColor: '#add8e6' }}>Housekeeping Start</TableCell>
                <TableCell style={{ backgroundColor: '#add8e6' }}>Housekeeping End</TableCell>
                <TableCell style={{ backgroundColor: '#add8e6' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((record) => (
                <TableRow key={record.housekeeping_id}>
                  <TableCell>{record.room_number || 'N/A'}</TableCell>
                  <TableCell>{record.housekeeping_start || 'N/A'}</TableCell>
                  <TableCell>{record.housekeeping_end || 'NOT DONE'}</TableCell>
                  <TableCell style={{ color: getStatusColor(record.housekeeping_status) }}>
                    {record.housekeeping_status || 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10]}
          component="div"
          count={records.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          labelRowsPerPage="Records per page"
        />

        <Button onClick={onClose} variant="contained" color="primary" style={{ marginTop: '20px' }}>
          Close
        </Button>
      </div>
    </Dialog>
  );
};

const HousekeepingComponent = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [records, setRecords] = useState([]);

  const fetchHousekeepingRecords = async () => {
    try {
      const housekeepingResponse = await axios.get('https://light-house-system-h74t-server.vercel.app/api/housekeeping-records');
      const housekeepingRecords = housekeepingResponse.data.filter(record => record.room_id && record.housekeeping_status);

      const roomIds = [...new Set(housekeepingRecords.map(record => record.room_id))];

      if (roomIds.length === 0) {
        setRecords(housekeepingRecords);
        return;
      }

      const roomResponse = await axios.get('https://light-house-system-h74t-server.vercel.app/api/room-numbers', {
        params: { room_ids: roomIds }
      });

      const roomMap = {};
      roomResponse.data.forEach(room => {
        roomMap[room.room_id] = room.room_number;
      });

      const recordsWithRoomNumbers = housekeepingRecords.map(record => ({
        ...record,
        room_number: roomMap[record.room_id] || 'N/A'
      }));

      setRecords(recordsWithRoomNumbers);
    } catch (error) {
      console.error('Error fetching housekeeping records:', error);
    }
  };

  const handleAllRecordsClick = () => {
    fetchHousekeepingRecords();
    setIsModalVisible(true);
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleAllRecordsClick} >
        ALL RECORD
      </Button>

      <AllHousekeepingRecordsModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        records={records}
      />
    </div>
  );
};

export default HousekeepingComponent;
