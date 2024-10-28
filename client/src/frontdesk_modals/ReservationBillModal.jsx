import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Snackbar, Alert, Grid, Table, TableHead, Button, TableBody, TableRow, TableCell, Typography, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import 'bulma/css/bulma.min.css';

const ReservationBillModal = ({ isOpen, onClose, checkInId, refreshCheckIn }) => {
  const [reservationDetails, setReservationDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCheckInId, setSelectedCheckInId] = useState(null);
  const [selectedGuestName, setSelectedGuestName] = useState(""); // State for guest name
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // State for confirmation modal
  const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'info', 
    });

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

  useEffect(() => {
    if (isOpen && checkInId) {
      const fetchReservationDetails = async () => {
        try {
          const response = await axios.get(
            `https://light-house-system-h74t-server.vercel.app/api/getCheckInBill?check_in_id=${checkInId}`
          );
          setReservationDetails(response.data);
        } catch (err) {
          setError('Failed to fetch reservation details.');
          setNotification({
            open: true,
            message: 'Failed to load details. Please refresh the page.',
            severity: 'error',
        });
          console.error('Error fetching reservation details:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchReservationDetails();
    }
  }, [isOpen, checkInId]);

  const handleCheckOut = async () => { 
    try {
        const response = await axios.put('https://light-house-system-h74t-server.vercel.app/api/updateCheckOut', {
            check_in_id: selectedCheckInId,
        });
        if (response.status === 200) {
            console.log(`Check-Out successful for ID: ${selectedCheckInId}`);
            setReservationDetails((prevDetails) => ({
                ...prevDetails,
                checkIn: {
                    ...prevDetails.checkIn,
                    check_in_status: 'CHECKED_OUT',
                    payment_status: 'PAID'
                }
            }));
            setIsConfirmModalOpen(false); 
           
             setNotification({
                open: true,
                message: 'Guest is checked-out successfully!',
                severity: 'success',
                
            });

            refreshCheckIn();

            setTimeout(() => {
                onClose();
            }, 1000);
            
        }
    } catch (error) {
        console.error(`Error during check-out:`, error);
        
        // Show error notification
        setNotification({
            open: true,
            message: 'Failed to check-out. Please try again.',
            severity: 'error',
        });
    }
  };


  const openConfirmModal = () => {
    if (reservationDetails) {
      setSelectedCheckInId(reservationDetails.checkIn.check_in_id);
      setSelectedGuestName(`${reservationDetails.guest.guest_fname} ${reservationDetails.guest.guest_lname}`);
      setIsConfirmModalOpen(true);
    }
  };

  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setSelectedCheckInId(null);
    setSelectedGuestName("");
  };


  const calculateFoodOrdersTotal = () => {
    if (!reservationDetails.foodOrders) return 0;
    return reservationDetails.foodOrders.reduce((total, order) => total + order.f_order_total, 0);
  };

  const calculateBarOrdersTotal = () => {
    if (!reservationDetails.barOrders) return 0;
    return reservationDetails.barOrders.reduce((total, order) => total + order.b_order_total, 0);
  };

  const calculateLaundryTotal = () => {
    return reservationDetails.totalLaundryCost || 0;
  };

  const calculateConciergeTotal = () => {
    return reservationDetails.totalConciergeCost || 0;
  };

  const calculateGrandTotal = () => {
    const roomCost = reservationDetails.total_cost || 0;
    const downPayment = reservationDetails.room_downpayment ? parseFloat(reservationDetails.room_downpayment) : 0;
    const foodTotal = calculateFoodOrdersTotal();
    const barTotal = calculateBarOrdersTotal();
    const laundryTotal = calculateLaundryTotal();
    const conciergeTotal = calculateConciergeTotal();
    return roomCost - downPayment + foodTotal + barTotal + laundryTotal + conciergeTotal;
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={`modal ${isOpen ? 'is-active' : ''}`}>
      <div className="modal-background" onClick={onClose}></div>
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
      <div className="modal-card" style={{ maxWidth: '95%', minWidth: '300px', width: 'auto' }}>
        <header className="modal-card-head">
          <p className="modal-card-title">Bill Details</p>
          <button className="delete" aria-label="close" onClick={onClose}></button>
        </header>
        <section className="modal-card-body">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="has-text-danger">{error}</p>
          ) : reservationDetails ? (
            
            <Grid container spacing={3}>
                            {/* Column 1: Reservation Details */}
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6">Reservation Details</Typography>
                                <Typography><strong>Guest Name:</strong> {reservationDetails.guest.guest_fname} {reservationDetails.guest.guest_lname}</Typography>
                                <Typography><strong>Staff Assigned:</strong> {reservationDetails.staff.staff_fname} {reservationDetails.staff.staff_lname}</Typography>
                                <Typography><strong>Room Type:</strong> {reservationDetails.room.room_type_name}</Typography>
                                <Typography><strong>Room Number:</strong> {reservationDetails.room.room_number}</Typography>
                                <Typography><strong>Check-In Date:</strong> {new Date(reservationDetails.room_check_in_date).toLocaleDateString()}</Typography>
                                <Typography><strong>Check-Out Date:</strong> {new Date(reservationDetails.room_check_out_date).toLocaleDateString()}</Typography>
                                <Typography><strong>Reservation Status:</strong> {reservationDetails.checkIn.check_in_status}</Typography>
                                <Typography><strong>Payment Status:</strong> {reservationDetails.checkIn.payment_status}</Typography>
                                <Typography><strong>Downpayment:</strong> ₱{reservationDetails.room_downpayment || 'No downpayment'}</Typography>
                                <Typography variant="h6" style={{ marginTop: '10px' }}><strong>Total After Downpayment:</strong> ₱{reservationDetails.total_cost.toFixed(2)}</Typography>
                            </Grid>

                            {/* Column 2: Food and Bar Orders */}
                            <Grid item xs={12} md={6}>
                                {/* Food Orders */}
                                {reservationDetails.foodOrders && reservationDetails.foodOrders.length > 0 && (
                                    <div>
                                        <Typography variant="h6">Food Orders</Typography>
                                        <Paper variant="outlined">
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Date</TableCell>
                                                        <TableCell>Status</TableCell>
                                                        <TableCell>Total</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {reservationDetails.foodOrders.map((order, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>{new Date(order.f_order_date).toLocaleDateString()}</TableCell>
                                                            <TableCell>{order.f_order_status}</TableCell>
                                                            <TableCell>₱{order.f_order_total.toFixed(2)}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </Paper>
                                        <Typography variant="subtitle1"><strong>Total: ₱{calculateFoodOrdersTotal().toFixed(2)}</strong></Typography>
                                    </div>
                                )}

                                {/* Bar Orders */}
                                {reservationDetails.barOrders && reservationDetails.barOrders.length > 0 && (
                                    <div style={{ marginTop: '20px' }}>
                                        <Typography variant="h6">Bar Orders</Typography>
                                        <Paper variant="outlined">
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Date</TableCell>
                                                        <TableCell>Status</TableCell>
                                                        <TableCell>Total</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {reservationDetails.barOrders.map((order, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>{new Date(order.b_order_date).toLocaleDateString()}</TableCell>
                                                            <TableCell>{order.b_order_status}</TableCell>
                                                            <TableCell>₱{order.b_order_total.toFixed(2)}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </Paper>
                                        <Typography variant="subtitle1"><strong>Total: ₱{calculateBarOrdersTotal().toFixed(2)}</strong></Typography>
                                    </div>
                                )}
                            </Grid>
                            <Grid item xs={12} md={6}>
                                {/* Existing Food and Bar Orders Tables */}
                                
                                {/* Laundry Total */}
                                {reservationDetails.totalLaundryCost > 0 && (
                                <Typography variant="h6">
                                    <strong>Laundry Total: ₱{calculateLaundryTotal().toFixed(2)}</strong>
                                </Typography>
                                )}

                                {/* Concierge Total */}
                                {reservationDetails.totalConciergeCost > 0 && (
                                <Typography variant="h6">
                                    <strong>Concierge Total: ₱{calculateConciergeTotal().toFixed(2)}</strong>
                                </Typography>
                                )}
                            </Grid>

                            {/* Grand Total */}
                            <Grid item xs={12}>
                                <Typography variant="h5" style={{ textAlign: 'center', marginTop: '20px' }}>
                                    <strong>Grand Total: ₱{calculateGrandTotal().toFixed(2)}</strong>
                                </Typography>
                            </Grid>
                        </Grid>
          ) : (
            <p>No details available.</p>
          )}
        </section>
        <footer className="modal-card-foot" style={{ justifyContent: 'flex-end' }}> 
            {/* Conditionally render the Check-Out button */}
            {reservationDetails?.checkIn?.check_in_status === 'CHECKED_IN' && (
                <Button
                variant="contained"
                color="primary"
                onClick={openConfirmModal} // Open confirm modal before checking out
                style={{ marginRight: '5px' }}
                >
                Check-Out
                </Button>
            )}
            <Button variant="contained" color="inverted-primary" onClick={onClose}>Close</Button>
            </footer>
        {/* Confirmation Modal */}
        <Dialog open={isConfirmModalOpen} onClose={handleCloseConfirmModal}>
          <DialogTitle>Confirm Check-Out</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to check out "{selectedGuestName}"?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseConfirmModal} color="secondary">Cancel</Button>
            <Button onClick={handleCheckOut} color="primary">Confirm</Button>
          </DialogActions>
        </Dialog>

       

        
      </div>
    </div>
  );
};

export default ReservationBillModal;
