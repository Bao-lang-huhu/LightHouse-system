import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bulma/css/bulma.min.css';

const ReservationDetailsModal = ({ isOpen, onClose, roomReservationId }) => {
  const [reservationDetails, setReservationDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch reservation details only if the modal is open and roomReservationId is provided
    if (isOpen && roomReservationId) {
      const fetchReservationDetails = async () => {
        try {
          setLoading(true);
          setError('');
          const response = await axios.get(
            `https://light-house-system.vercel.app/api/getReservationsByReservationId?room_reservation_id=${roomReservationId}`
          );
          setReservationDetails(response.data[0]); // Assuming the API returns an array
        } catch (err) {
          setError('Failed to fetch reservation details.');
          console.error('Error fetching reservation details:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchReservationDetails();
    }
  }, [isOpen, roomReservationId]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={`modal ${isOpen ? 'is-active' : ''}`}>
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">Reservation Details</p>
          <button className="delete" aria-label="close" onClick={onClose}></button>
        </header>
        <section className="modal-card-body">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="has-text-danger">{error}</p>
          ) : reservationDetails ? (
            <div>
              <p><strong>Reservation ID:</strong> {reservationDetails.room_reservation_id}</p>
              <p><strong>Guest ID:</strong> {reservationDetails.guest_id}</p>
              <p><strong>Room Type:</strong> {reservationDetails.room_type_name}</p>
              <p><strong>Room Number:</strong> {reservationDetails.room_number}</p>
              <p><strong>Total Cost:</strong> ₱{reservationDetails.total_cost.toFixed(2)}</p>
              <p><strong>Check-In Date:</strong> {new Date(reservationDetails.room_check_in_date).toLocaleDateString()}</p>
              <p><strong>Check-Out Date:</strong> {new Date(reservationDetails.room_check_out_date).toLocaleDateString()}</p>
              <p><strong>Reservation Status:</strong> {reservationDetails.reservation_status}</p>
            </div>
          ) : (
            <p>No details available.</p>
          )}
        </section>
        <footer className="modal-card-foot">
          <button className="button" onClick={onClose}>Close</button>
        </footer>
      </div>
    </div>
  );
};

export default ReservationDetailsModal;
