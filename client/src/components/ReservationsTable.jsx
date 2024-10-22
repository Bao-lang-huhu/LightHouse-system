import React, { useState, useEffect } from 'react';
import { IoSearchCircle, IoTime } from 'react-icons/io5';
import axios from 'axios';
import '../App.css';
import { Snackbar, Alert } from '@mui/material';

const ReservationsTable = () => {
    const [ongoingReservations, setOngoingReservations] = useState([]);
    const [reservationHistory, setReservationHistory] = useState([]);
    const [filteredOngoing, setFilteredOngoing] = useState([]);  // To hold the filtered results
    const [filteredHistory, setFilteredHistory] = useState([]);  // To hold the filtered results
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [reservationToCancel, setReservationToCancel] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(''); // State for filter by status
    const [isSearching, setIsSearching] = useState(false); // Toggle between Search and Clear buttons
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    // Helper function to format date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const formatTime = (timeString) => {
        if (!timeString) return 'Invalid time';
        let [hour, minute] = timeString.split(':');
        const period = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12;  // Convert to 12-hour format
        return `${hour}:${minute} ${period}`;
    };

    // Helper function to calculate the difference in days between two dates
    const getDaysDifference = (reservationDate) => {
        const currentDate = new Date();
        const resDate = new Date(reservationDate);
        const differenceInTime = resDate.getTime() - currentDate.getTime();
        return Math.ceil(differenceInTime / (1000 * 3600 * 24)); // Convert to days
    };

    useEffect(() => {
        const fetchTableReservations = async () => {
            const guestId = localStorage.getItem('guest_id');  // Assuming guest_id is stored in localStorage
            if (!guestId) {
                setError('Guest ID not found. Please log in.');
                return;
            }
            try {
                const response = await axios.get('http://localhost:3001/api/getTableRevByGuestID', {
                    params: { guest_id: guestId }
                });
                const reservations = response.data;
                if (reservations.length === 0) {
                    setError('No table reservations found for this guest.');
                    return;
                }
                const ongoing = reservations.filter(reservation =>
                    ['CONFIRMED', 'PENDING'].includes(reservation.reservation_status)
                );
                const history = reservations.filter(reservation =>
                    ['CANCELED', 'COMPLETED'].includes(reservation.reservation_status)
                );
                setOngoingReservations(ongoing);
                setReservationHistory(history);
                setFilteredOngoing(ongoing);  
                setFilteredHistory(history);  
            } catch (error) {
                console.error('Error fetching table reservations:', error);
                
                if (error.response && error.response.status === 404) {
                    setError('No table reservations found for your account.');
                  } else if (error.response && error.response.status === 500){
                    setError('Check your ethernet connectivity.');
                  }
                  else {
                    setError('Failed to load reservations. ' + (error.message || ''));
                  }
            }
        };
        fetchTableReservations();
    }, []);

    const handleCancel = async () => {
        if (!reservationToCancel) return;
    
        try {
            // Optimistically filter out the canceled reservation
            setOngoingReservations(ongoingReservations.filter(res => res.table_reservation_id !== reservationToCancel));
            
            // Call the API to cancel the reservation
            await axios.post('http://localhost:3001/api/cancelTableReservation', {
                table_reservation_id: reservationToCancel,
                cancel_reason: cancelReason
            });
    
            // Fetch the updated reservations after cancellation
            const guestId = localStorage.getItem('guest_id');
            if (guestId) {
                const response = await axios.get('http://localhost:3001/api/getTableRevByGuestID', {
                    params: { guest_id: guestId }
                });
                const reservations = response.data;
                const ongoing = reservations.filter(reservation => ['CONFIRMED', 'PENDING'].includes(reservation.reservation_status));
                const history = reservations.filter(reservation => ['CANCELED', 'COMPLETED'].includes(reservation.reservation_status));
                setOngoingReservations(ongoing);
                setReservationHistory(history);
                setFilteredOngoing(ongoing);
                setFilteredHistory(history);
            }
    
            // Close the modal and reset the cancel reason
            setIsModalOpen(false);
            setCancelReason('');
    
            // Show success notification
            setNotification({
                open: true,
                message: 'Reservation cancelled successfully.',
                severity: 'success'
            });
    
        } catch (error) {
            console.error('Error cancelling reservation:', error);
    
            // Show error notification
            setNotification({
                open: true,
                message: 'Failed to cancel the reservation.',
                severity: 'error'
            });
        }
    };
    

    const handleSearch = () => {
        setIsSearching(true);
        const statusMatch = (reservation) => !statusFilter || reservation.reservation_status === statusFilter;
        if (!searchTerm) {
            setFilteredOngoing(ongoingReservations.filter(statusMatch));
            setFilteredHistory(reservationHistory.filter(statusMatch));
        } else {
            const filteredOngoing = ongoingReservations.filter(reservation =>
                reservation.table_reservation_date.includes(searchTerm) && statusMatch(reservation)
            );
            const filteredHistory = reservationHistory.filter(reservation =>
                reservation.table_reservation_date.includes(searchTerm) && statusMatch(reservation)
            );
            setFilteredOngoing(filteredOngoing);
            setFilteredHistory(filteredHistory);
        }
    };

    const handleClear = () => {
        setSearchTerm('');
        setStatusFilter('');
        setIsSearching(false);
        setFilteredOngoing(ongoingReservations);
        setFilteredHistory(reservationHistory);
    };

    const openCancelModal = (reservationId) => {
        setReservationToCancel(reservationId);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCancelReason('');
        setReservationToCancel(null);
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };
    

    if (error) {
        return (
            <div className="box" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
                <div className="notification">{error}</div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="title is-4 has-text-white">Table Reservation</h2>
                    {/* Search Bar */}
                    <div className="column is-hidden-tablet-only custom-hide-tablet is-fullwidth" style={{ padding: '0', margin: '0' }}>
                        <div className="field has-addons is-flex is-flex-direction-column-mobile is-flex-direction-row-tablet is-fullwidth">
                            {/* Search Input */}
                            <div className="control is-expanded is-fullwidth mb-2-mobile">
                            <input
                                className="input"
                                type="date"
                                style={{ margin: '0', height: '45px' }} 
                                placeholder="Search by reservation date..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            </div>

                            {/* Status Dropdown */}
                            <div className="control is-fullwidth mb-2-mobile">
                            <div className="select is-fullwidth" style={{ height: '45px', display: 'flex', alignItems: 'center' }}>
                                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ height: '100%', paddingTop: '0', paddingBottom: '0' }}>
                                <option value="">All Statuses</option>
                                <option value="PENDING">Pending</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELED">Canceled</option>
                                
                                </select>
                            </div>
                            </div>

                            {/* Search Button */}
                            <div className="control is-fullwidth">
                            {isSearching ? (
                                <button className="button is-light is-fullwidth" style={{ height: '45px' }} onClick={handleClear}>
                                Clear
                                </button>
                            ) : (
                                <button className="button is-inverted-blue is-fullwidth" style={{ height: '45px' }} onClick={handleSearch}>
                                <IoSearchCircle className="is-white" size={32} /> Search...
                                </button>
                            )}
                            </div>
                        </div>
                    </div>

                    {/* Ongoing Reservations */}
                    <div className="container">
                        <div className="box">
                            <h3 className="title is-5">Ongoing Reservations</h3>
                            <p className='is-flex is-align-items-center label is-5 m-1' style={{ wordBreak: 'keep-all', whiteSpace: 'normal' }}>
                               <IoTime className='mr-1 has-text-danger' />
                                    Cancellation is allowed 2 days remaining before the reservation date
                            </p>
                            <div className="columns is-multiline">
                           
                                {filteredOngoing.length > 0 ? (
                                    filteredOngoing.map((reservation) => {
                                        const daysDifference = getDaysDifference(reservation.table_reservation_date);
                                        return (
                                            <div className="column is-12-mobile is-6-tablet is-4-desktop" key={reservation.table_reservation_id}>
                                                <div className="box" style={{ border: "2px solid #0077B7" }}>
                                                    <div className="content">
                                                    <p>Reserved Date: <strong>{formatDate(reservation.table_reservation_date)}</strong> on <strong>{formatTime(reservation.table_time)}</strong></p>
                                                    <p className='label is-size-4'> <strong>{reservation.table_name}</strong> </p>
                                                    <p>Guest Quantity: <strong>{reservation.table_guest_quantity || 'N/A'}</strong></p>
                                                    <p>Notes: <strong>{reservation.table_notes || 'No Notes'}</strong></p>
                                                    <p>Status: <strong>{reservation.reservation_status}</strong></p>
                                                    {['CONFIRMED', 'PENDING'].includes(reservation.reservation_status) && (
                                                        daysDifference > 2 ? (
                                                            <button
                                                                className="button is-danger is-fullwidth-mobile"
                                                                style={{ wordBreak: 'keep-all', whiteSpace: 'normal', textAlign: 'center' }} // Ensures words break naturally
                                                                onClick={() => openCancelModal(reservation.table_reservation_id)}
                                                            >
                                                                Cancel ({daysDifference} days before reservation)
                                                            </button>
                                                        ) : (
                                                            <div className="has-text-centered-mobile">
                                                                <p className='has-text-danger is-flex is-align-items-center' style={{ wordBreak: 'keep-all', whiteSpace: 'normal' }}>
                                                                    <IoTime className='mr-1 has-text-danger' />
                                                                    Cancellation not allowed (less than 2 days remaining)
                                                                </p>
                                                            </div>
                                                        )
                                                    )}



                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p>No ongoing table reservations.</p>
                                )}
                            </div>
                        </div>

                        {/* Reservation History */}
                        <div className="box">
                            <h3 className="title is-5">Reservation History</h3>
                            <div className="columns is-multiline">  {/* Flex for multiple boxes in a row */}
                                {filteredHistory.length > 0 ? (
                                    filteredHistory.map((reservation) => (
                                        <div className="column is-12-mobile is-6-tablet is-4-desktop" key={reservation.table_reservation_id}> {/* 3 boxes per row on desktop */}
                                            <div className="box" style={{ border: "2px solid #0077B7" }}>
                                                <div className="content">
                                                    <p><strong>Reservation Date:</strong> {formatDate(reservation.table_reservation_date)} on {formatTime(reservation.table_time)}</p>
                                                    <p className='label is-size-4'><strong>{reservation.table_name}</strong> </p>
                                                    <p><strong>Guest Quantity:</strong> {reservation.table_guest_quantity || 'N/A'}</p>
                                                    <p><strong>Notes:</strong> {reservation.table_notes || 'No Notes'}</p>
                                                    <p><strong>Status:</strong> {reservation.reservation_status}</p>
                                                    {reservation.reservation_status === 'CANCELED' && (
                                                        <div className="notification is-danger">
                                                            <p><strong>Reason for Cancellation:</strong> {reservation.cancel_reservation_request || 'No reason provided.'}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>No reservation history available.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Modal for cancellation */}
                    {isModalOpen && (
                        <div className="modal is-active">
                            <div className="modal-background" onClick={closeModal}></div>
                            <div className="modal-card">
                                <header className="modal-card-head">
                                    <p className="modal-card-title">Cancel Reservation</p>
                                    <button className="delete" onClick={closeModal}></button>
                                </header>
                                <section className="modal-card-body">
                                    <div className="field">
                                        <label className="label">Reason for Cancellation</label>
                                        <div className="control">
                                            <textarea
                                                className="textarea"
                                                placeholder="Please provide a reason"
                                                value={cancelReason}
                                                onChange={(e) => setCancelReason(e.target.value)}
                                            ></textarea>
                                        </div>
                                    </div>
                                </section>
                                <footer className="modal-card-foot">
                                    <button className="button is-danger" onClick={handleCancel}>Confirm Cancellation</button>
                                    <button className="button" onClick={closeModal}>Cancel</button>
                                </footer>
                            </div>
                        </div>
                    )}

            <Snackbar
                open={notification.open}
                autoHideDuration={3000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                sx={{ width: '400px' }}  >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    style={{ fontSize: '1.2rem', padding: '20px' }} 
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default ReservationsTable;

