import React, { useState, useEffect } from 'react';
import { IoSearchCircle } from 'react-icons/io5';
import axios from 'axios';
import '../App.css';

const ReservationsTable = () => {
    const [ongoingReservations, setOngoingReservations] = useState([]);
    const [reservationHistory, setReservationHistory] = useState([]);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [reservationToCancel, setReservationToCancel] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Helper function to format date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const formatTime = (timeString) => {
        if (!timeString) {
            return 'Invalid time'; // Handle invalid or null time gracefully
        }
    
        let [hours, minutes] = timeString.split(':');
        let hour = parseInt(hours, 10);
        let period = 'AM';
    
        if (hour >= 2 && hour <= 5) {
            period = 'PM';
        } else if (hour === 12) {
            period = 'PM'; // Handle noon
        } else if (hour < 9 || hour === 12) {
            period = 'AM'; // Handle morning and midnight (if time is explicitly 12:00 AM)
        }
    
        return `${hour}:${minutes.padStart(2, '0')} ${period}`;
    };
    
    
    

    useEffect(() => {
        const fetchReservations = async () => {
            const guestId = localStorage.getItem('guest_id');

            if (!guestId) {
                setError('Guest ID not found. Please log in.');
                return;
            }

            try {
                const response = await axios.get('http://localhost:3001/api/getTableRevByGuestID', {
                    params: { guest_id: guestId }
                });

                const reservations = response.data;

                // Separate ongoing and history reservations
                const ongoing = reservations.filter(reservation => ['CONFIRMED', 'PENDING'].includes(reservation.reservation_status));
                const history = reservations.filter(reservation => ['CANCELED', 'COMPLETED'].includes(reservation.reservation_status));

                setOngoingReservations(ongoing);
                setReservationHistory(history);
            } catch (error) {
                console.error('Error fetching table reservations:', error);
                setError('Failed to load reservations. ' + (error.message || ''));
            }
        };

        fetchReservations();
    }, []);

 
        // Handle Cancel
    const handleCancel = async () => {
        if (!reservationToCancel) return;

        try {
            // Optimistically remove the reservation from the list
            setOngoingReservations(ongoingReservations.filter(res => res.table_reservation_id !== reservationToCancel));

            // Send the cancellation request to the backend
            await axios.post('http://localhost:3001/api/cancelTableReservation', {
                table_reservation_id: reservationToCancel,
                cancel_reason: cancelReason
            });

            alert('Reservation cancelled successfully.');
            setIsModalOpen(false);

            // After cancellation, re-fetch the reservations to update the list with the latest data
            const guestId = localStorage.getItem('guest_id');
            if (guestId) {
                const response = await axios.get('http://localhost:3001/api/getTableRevByGuestID', {
                    params: { guest_id: guestId }
                });

                const reservations = response.data;
                const ongoing = reservations.filter(reservation => ['CONFIRMED', 'PENDING'].includes(reservation.reservation_status));
                const history = reservations.filter(reservation => ['CANCELED', 'COMPLETED'].includes(reservation.reservation_status));

                // Update the state with the re-fetched data
                setOngoingReservations(ongoing);
                setReservationHistory(history);
            }

        } catch (error) {
            alert('Failed to cancel the reservation.');
            console.error('Error cancelling reservation:', error);
        }
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

    // Search by reservation date
    const handleSearch = () => {
        const filteredOngoing = ongoingReservations.filter(reservation =>
            reservation.table_reservation_date.includes(searchTerm)
        );
        const filteredHistory = reservationHistory.filter(reservation =>
            reservation.table_reservation_date.includes(searchTerm)
        );
        setOngoingReservations(filteredOngoing);
        setReservationHistory(filteredHistory);
    };

    // Clear the search
    const handleClearSearch = () => {
        setSearchTerm('');
        // Re-fetch the reservations to reset the filtered list
        window.location.reload(); // Reload the page to reset the data (or refetch from the API)
    };

    if (error) {
        return <div className="notification is-danger">{error}</div>;
    }

    return (
        <div>
            <h2 className="title is-4 has-text-white">Table Reservation</h2>

            {/* Search Bar */}
            <div className="column is-hidden-tablet-only custom-hide-tablet is-fullwidth" style={{ padding: '0', margin: '0' }}>
                <div className="field has-addons is-flex is-flex-direction-row is-fullwidth-mobile">
                    <div className="control is-expanded is-fullwidth">
                        <input
                            className="input is-fullwidth-mobile"
                            type="date"
                            style={{ margin: '0' }}
                            placeholder="Search by reservation date..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)} 
                        />
                    </div>
                    <div className="control is-fullwidth">
                        <button className="button is-blue is-fullwidth-mobile" style={{ height: '100%' }} onClick={handleSearch}>
                            <IoSearchCircle className="is-white" />
                        </button>
                    </div>
                    <div className="control is-fullwidth ml-2">
                        <button className="button is-light is-fullwidth-mobile" style={{ height: '100%' }} onClick={handleClearSearch}>
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            <div className="columns">
                {/* Ongoing Reservations */}
                <div className="column">
                    <div className="box">
                        <h3 className="title is-5">Ongoing Reservations</h3>
                        {ongoingReservations.length > 0 ? (
                            ongoingReservations.map((reservation) => (
                                <div className='box' key={reservation.table_reservation_id}>
                                    <div className="columns">
                                        <div className="column is-8">
                                            <p><strong>Table Name:</strong> {reservation.table_name}</p>
                                            <p><strong>Table ID:</strong> {reservation.table_id}</p>
                                            <p><strong>Reservation Date:</strong> {formatDate(reservation.table_reservation_date)} on {formatTime(reservation.table_time)}</p> {/* Format time correctly */}
                                            <p><strong>Seats:</strong> {reservation.seat_quantity}</p>
                                            <p><strong>Guest Quantity:</strong> {reservation.table_guest_quantity || 'N/A'}</p>
                                            <p><strong>Notes:</strong> {reservation.table_notes || 'N/A'}</p>
                                        </div>
                                        <div className="column is-4 is-flex is-justify-content-flex-end">
                                            {['CONFIRMED', 'PENDING'].includes(reservation.reservation_status) && (
                                                <button className="button is-danger" onClick={() => openCancelModal(reservation.table_reservation_id)}>
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No ongoing table reservations.</p>
                        )}
                    </div>
                </div>

                {/* Reservation History */}
                <div className="column">
                    <div className="box">
                        <h3 className="title is-5">Reservation History</h3>
                        {reservationHistory.length > 0 ? (
                            reservationHistory.map((reservation) => (
                                <div className='box' key={reservation.table_reservation_id}>
                                    <p><strong>Table Name:</strong> {reservation.table_name}</p>
                                    <p><strong>Table ID:</strong> {reservation.table_id}</p>
                                    <p><strong>Table Time:</strong> {formatTime(reservation.table_time)}</p>
                                    <p><strong>Reservation Date:</strong> {formatDate(reservation.table_reservation_date)}</p>
                                    <p><strong>Seats:</strong> {reservation.seat_quantity}</p>
                                    <p><strong>Guest Quantity:</strong> {reservation.table_guest_quantity || 'N/A'}</p>
                                    <p><strong>Notes:</strong> {reservation.table_notes || 'N/A'}</p>
                                    <p><strong>Status:</strong> {reservation.reservation_status}</p>
                                    {reservation.reservation_status === 'CANCELED' && (
                                        <p><strong>Reason for Cancellation:</strong> {reservation.cancel_reservation_request}</p>
                                    )}
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
        </div>
    );
};

export default ReservationsTable;

