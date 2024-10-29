import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Dialog, DialogTitle, DialogContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Paper, Button, Typography
} from '@mui/material';

// Function to return color based on maintenance status
const getStatusColor = (status) => {
  if (status === 'COMPLETE') return 'green';
  if (status === 'ONGOING') return 'orange';
  return 'black';
};

const AllMaintenanceRecordsModal = ({ isVisible, onClose }) => {
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  useEffect(() => {
    if (isVisible) {
      fetchMaintenanceRecords();
    }
  }, [isVisible]);

  const fetchMaintenanceRecords = async () => {
    try {
      const response = await axios.get('https://light-house-system-h74t-server.vercel.app/api/maintenance-records');
      setMaintenanceRecords(response.data);
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
    }
  };

  const handlePageChange = (event, newPage) => setPage(newPage);

  return (
    <Dialog open={isVisible} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>
        <Typography variant="h5" fontWeight="bold">Maintenance Records</Typography>
      </DialogTitle>
      <DialogContent dividers>
        <TableContainer component={Paper}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Room Number</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {maintenanceRecords.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((record) => (
                <TableRow key={record.maintenance_id}>
                  <TableCell>{record.room_number || 'N/A'}</TableCell>
                  <TableCell>{record.maintenance_type || 'N/A'}</TableCell>
                  <TableCell style={{ color: getStatusColor(record.maintenance_status) }}>
                    {record.maintenance_status || 'N/A'}
                  </TableCell>
                  <TableCell>{record.maintenance_notes || 'No notes available'}</TableCell>
                  <TableCell>{new Date(record.maintenance_date_time_start).toLocaleString()}</TableCell>
                  <TableCell>
                    {record.maintenance_date_time_end
                      ? new Date(record.maintenance_date_time_end).toLocaleString()
                      : 'Ongoing'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10]}
          component="div"
          count={maintenanceRecords.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          labelRowsPerPage="Records per page"
        />
      </DialogContent>
      <Button onClick={onClose} variant="contained" color="primary" sx={{ m: 2 }}>
        Close
      </Button>
    </Dialog>
  );
};

export default AllMaintenanceRecordsModal;
