import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Snackbar, Alert, IconButton, Pagination 
} from '@mui/material';
import axios from 'axios';

const AllConciergeRecords = ({ open, onClose }) => {
  const [conciergeRecords, setConciergeRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const recordsPerPage = 5;   
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info', 
});

const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
};


  useEffect(() => {
    if (open) fetchConciergeRecords();
  }, [open]);

  const refreshConciergeList = () => {
    fetchConciergeRecords();// Fetch the staff data again
};

const fetchConciergeRecords = async () => {
  try {
      const response = await axios.get('http://localhost:3001/api/getAllConciergeRecords');
      console.log("Fetched Concierge Records:", response.data); // Log the response data
      setConciergeRecords(response.data);
  } catch (error) {
      console.error('Error fetching concierge records:', error);
  }
};


  const handleViewDetails = (record) => {
    console.log("Selected Record for Details:", record);
    setSelectedRecord(record);
    setDetailsOpen(true);
  };
  

  const handleArchive = async (recordId) => {
    if (!recordId) {
        console.error("Error: av_concierge_id is undefined.");
        setNotification({
            open: true,
            message: 'Error archiving concierge order. Invalid ID.',
            severity: 'error',
        });
        return;
    }

    try {
        await axios.put(`http://localhost:3001/api/updateConciergeStatus`, {
            av_concierge_id: recordId,
            av_concierge_status: 'DELETE'
        });
        setNotification({
            open: true,
            message: 'Concierge order archived successfully.',
            severity: 'success',
        });
        refreshConciergeList();
    } catch (error) {
        console.error('Error updating concierge status:', error);
        setNotification({
            open: true,
            message: 'Error archiving concierge order. Please try again.',
            severity: 'error',
        });
    }
};


  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const paginatedRecords = conciergeRecords.slice((page - 1) * recordsPerPage, page * recordsPerPage);

  return (
    <>
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>All Concierge Records</DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table aria-label="Concierge Records Table">
            <TableHead>
              <TableRow>
                <TableCell><strong>Room Number</strong></TableCell>
                <TableCell><strong>Guest Name</strong></TableCell>
                <TableCell><strong>Concierge Notes</strong></TableCell>
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
                  <TableCell>{record.av_concierge_notes || 'No Notes'}</TableCell>
                  <TableCell>₱ {record.av_concierge_total_price || '0.00'}</TableCell>
                  <TableCell>{record.av_concierge_status || 'No Status'}</TableCell>
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
    onClick={() => handleArchive(record.av_concierge_id)} // Ensure this ID is defined
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
          count={Math.ceil(conciergeRecords.length / recordsPerPage)} 
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
  <DialogTitle>Concierge Record Details</DialogTitle>
  <DialogContent>
    {selectedRecord && (
      <>
        <p><strong>Room Number:</strong> {selectedRecord.room_number || 'No Room'}</p>
        <p><strong>Guest Name:</strong> {selectedRecord.guest_name || 'No Guest'}</p>
        <p><strong>Concierge Notes:</strong> {selectedRecord.av_concierge_notes || 'No Notes'}</p>
        <p><strong>Total Price:</strong> ₱{selectedRecord.av_concierge_total_price || '0.00'}</p>
        <p><strong>Status:</strong> {selectedRecord.av_concierge_status || 'No Status'}</p>

        {/* Table for Concierge Items */}
        <TableContainer component={Paper} sx={{ marginTop: 2 }}>
          <Table aria-label="Concierge Items Table">
            <TableHead>
              <TableRow>
                <TableCell><strong>Package Name</strong></TableCell>
                <TableCell><strong>Supplier</strong></TableCell>
                <TableCell><strong>Quantity</strong></TableCell>
                <TableCell><strong>Subtotal</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedRecord.concierge_items && selectedRecord.concierge_items.length > 0 ? (
                selectedRecord.concierge_items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.concierge_type || 'N/A'}</TableCell>
                    <TableCell>{item.concierge_supplier || 'N/A'}</TableCell>
                    <TableCell>{item.concierge_quantity || '0'}</TableCell>
                    <TableCell>₱{item.concierge_subtotal ? item.concierge_subtotal.toFixed(2) : '0.00'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">No Concierge Items Available</TableCell>
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

export default AllConciergeRecords;
