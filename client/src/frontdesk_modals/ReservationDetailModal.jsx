import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bulma/css/bulma.min.css';

const ReservationDetailsModal = ({ isOpen, onClose, roomReservationId }) => {
  const [reservationDetails, setReservationDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && roomReservationId) {
      const fetchReservationDetails = async () => {
        try {
          setLoading(true);
          setError('');
          const response = await axios.get(
            `http://localhost:3001/api/getCheckIn?room_reservation_id=${roomReservationId}`
          );
          console.log(response.data[0]); // Check the structure of the response
          setReservationDetails(response.data[0]);
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
  
  // Calculate how many days before checking out
  const calculateDaysBeforeCheckout = (checkOutDate) => {
    const today = new Date();
    const checkout = new Date(checkOutDate);
    const differenceInTime = checkout - today;
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    return differenceInDays > 0 ? `${differenceInDays} day(s) left` : "Checkout date has passed";
  };
  const calculateTotalCost = (totalCost, downPayment) => {
    // Treat null, undefined, or 0 as no downpayment
    const parsedDownPayment = downPayment ? parseFloat(downPayment) : 0;

    // If there's no downpayment (i.e., parsedDownPayment is 0), return the full cost
    if (parsedDownPayment <= 0) {
        return `₱${totalCost.toFixed(2)}`;
    }

    const remainingCost = totalCost - parsedDownPayment;

    // Ensure that the remaining cost is not negative
    if (remainingCost < 0) {
        return 'Invalid downpayment amount';
    }

    return `₱${remainingCost.toFixed(2)}`;
};

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
              <p className='is-size-4'>Guest Name: <strong>{reservationDetails.guest?.guest_fname} {reservationDetails.guest?.guest_lname}</strong></p>
              <p className='is-size-4'>Staff Assigned: <strong>{reservationDetails.staff?.staff_fname} {reservationDetails.staff?.staff_lname}</strong></p>

              <p className='is-size-5'>Room Type: <strong>{reservationDetails.room_type_name}</strong></p>
              <p className='is-size-5'>Room Number: <strong>{reservationDetails.room_number}</strong></p>
              <div className='mb-2 mt-2'>
                <p className='is-size-5'>Check-In Date: <strong>{new Date(reservationDetails.room_check_in_date).toLocaleDateString()}</strong></p>
                <p className='is-size-5'>Check-Out Date: <strong>{new Date(reservationDetails.room_check_out_date).toLocaleDateString()}</strong></p>
                <p className='is-size-5'>Days Before Check-Out: <strong>{calculateDaysBeforeCheckout(reservationDetails.room_check_out_date)}</strong></p>
              </div>
              <p className='is-size-5'>Reservation Status: <strong>{reservationDetails.checkIn?.check_in_status}</strong></p>
              <p className='is-size-5'>Payment Status: <strong>{reservationDetails.checkIn?.payment_status}</strong></p>

              <p className='is-size-5'>Downpayment: <strong>{reservationDetails.room_downpayment ? `₱${reservationDetails.room_downpayment}` : 'No downpayment'}</strong></p>
              <p className='is-size-5'>Room Cost: <strong>₱{reservationDetails.total_cost.toFixed(2)}</strong></p>
              <p className='is-size-4'>Total After Downpayment: <strong>{calculateTotalCost(reservationDetails.total_cost, reservationDetails.room_downpayment)}</strong></p>
          
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
