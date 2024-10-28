import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Snackbar, Alert, IconButton, Pagination 
} from '@mui/material';
import axios from 'axios';

const AllLaundryRecords = ({ open, onClose }) => {
  const [laundryRecords, setLaundryRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const recordsPerPage = 5;   
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info', 
  });

  const formatTimestamp = (timestamp) => {
    return timestamp ? new Date(timestamp).toLocaleString() : 'No Date';
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  useEffect(() => {
    if (open) fetchLaundryRecords();
  }, [open]);

  const refreshLaundryList = () => {
    fetchLaundryRecords(); // Refresh laundry records after an update
  };

  const fetchLaundryRecords = async () => {
    try {
      const response = await axios.get('https://light-house-system-h74t-server.vercel.app/api/getAllLaundryRecords');
      console.log("Fetched Laundry Records:", response.data);
      setLaundryRecords(response.data);
    } catch (error) {
      console.error('Error fetching laundry records:', error);
    }
  };

  const handleViewDetails = (record) => {
    console.log("Selected Record for Details:", record);
    setSelectedRecord(record);
    setDetailsOpen(true);
  };

  const handleArchive = async (recordId) => {
    if (!recordId) {
      console.error("Error: av_laundry_id is undefined.");
      setNotification({
        open: true,
        message: 'Error archiving laundry order. Invalid ID.',
        severity: 'error',
      });
      return;
    }

    try {
      await axios.put(`https://light-house-system-h74t-server.vercel.app/api/updateLaundryStatus`, {
        av_laundry_id: recordId,
        laun_status: 'CANCELED'
      });
      setNotification({
        open: true,
        message: 'Laundry order archived successfully.',
        severity: 'success',
      });
      refreshLaundryList();
    } catch (error) {
      console.error('Error updating laundry status:', error);
      setNotification({
        open: true,
        message: 'Error archiving laundry order. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const paginatedRecords = laundryRecords.slice((page - 1) * recordsPerPage, page * recordsPerPage);

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
        <DialogTitle>All Laundry Records</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table aria-label="Laundry Records Table">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Room Number</strong></TableCell>
                  <TableCell><strong>Guest Name</strong></TableCell>
                  <TableCell><strong>Laundry Notes</strong></TableCell>
                  <TableCell><strong>Total Cost</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRecords.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell>{record.room_number || 'No Room'}</TableCell>
                    <TableCell>{record.guest_name || 'No Guest'}</TableCell>
                    <TableCell>{record.laun_notes || 'No Notes'}</TableCell>
                    <TableCell>₱ {record.laun_total_price || '0.00'}</TableCell>
                    <TableCell>{record.laun_status || 'No Status'}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        color="primary" 
                        onClick={() => handleViewDetails(record)}
                      >
                        View Details
                      </Button>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        color="secondary" 
                        onClick={() => handleArchive(record.av_laundry_id)}
                        style={{ marginLeft: '8px' }}
                      >
                        Archive
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Pagination 
            count={Math.ceil(laundryRecords.length / recordsPerPage)} 
            page={page} 
            onChange={handleChangePage} 
            color="primary" 
            style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary">Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Laundry Record Details</DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <>
              <p><strong>Room Number:</strong> {selectedRecord.room_number || 'No Room'}</p>
              <p><strong>Guest Name:</strong> {selectedRecord.guest_name || 'No Guest'}</p>
              <p><strong>Laundry Notes:</strong> {selectedRecord.laun_notes || 'No Notes'}</p>
              <p><strong>Total Price:</strong> ₱{selectedRecord.laun_total_price || '0.00'}</p>
              <p><strong>Start Date and Time:</strong> {formatTimestamp(selectedRecord.laun_start_date)}</p>
              <p><strong>End Date and Time:</strong> {formatTimestamp(selectedRecord.laun_end_date)}</p>
              <p className='is-size-6'><strong>Status:</strong> {selectedRecord.laun_status || 'No Status'}</p>

              {/* Outsourced Laundry Details */}
              {selectedRecord.laun_is_outsourced && selectedRecord.outsourced_details && (
                <div style={{ marginTop: '16px' }}>
                  <h3 className='is-size-5'><strong>Outsourced Laundry Details</strong></h3>
                  <p><strong>Outsource Name:</strong> {selectedRecord.outsourced_details.laun_outsource_name}</p>
                  <p><strong>Posted By:</strong> {selectedRecord.outsourced_details.laun_posted_by}</p>
                  <p><strong>Date Posted:</strong> {selectedRecord.outsourced_details.laun_date_posted}</p>
                  <p><strong>Delivered By:</strong> {selectedRecord.outsourced_details.laun_delivered_by}</p>
                </div>
              )}

              {/* Table for Laundry Items */}
              <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                <Table aria-label="Laundry Items Table">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Laundry Item</strong></TableCell>
                      <TableCell><strong>Ironing Price</strong></TableCell>
                      <TableCell><strong>Quantity</strong></TableCell>
                      <TableCell><strong>Subtotal</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedRecord.laundry_items && selectedRecord.laundry_items.length > 0 ? (
                      selectedRecord.laundry_items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.laundry_item || 'N/A'}</TableCell>
                          <TableCell>₱{item.ironing_price || '0.00'}</TableCell>
                          <TableCell>{item.quantity || '0'}</TableCell>
                          <TableCell>₱{item.subtotal ? item.subtotal.toFixed(2) : '0.00'}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">No Laundry Items Available</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)} color="primary">Close</Button>
        </DialogActions>
      </Dialog>

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
    </>
  );
};

export default AllLaundryRecords;
