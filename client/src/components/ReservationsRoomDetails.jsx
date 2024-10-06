import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom'; // Use useParams to retrieve route parameters
import { IoArrowBackOutline } from 'react-icons/io5'; // Import the back icon
import axios from 'axios'; // Axios for API calls
import '../App.css';

const ReservationsRoomDetails = () => {
  const { room_reservation_id } = useParams(); // Get room_reservation_id from the route params
  const [reservationDetails, setReservationDetails] = useState(null);
  const [guestInfo, setGuestInfo] = useState(null);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [cancelReason, setCancelReason] = useState(''); // Cancel reason

  useEffect(() => {
    // Fetch reservation details
    const fetchReservationDetails = async () => {
      try {
        const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage

        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get(`https://light-house-system.vercel.app/api/getReservationsByReservationId`, {
          params: { room_reservation_id },
          headers: {
            Authorization: `Bearer ${token}` // Attach the token to the request
          }
        });

        const reservationData = response.data[0];
        setReservationDetails(reservationData);

        // Fetch guest information using guest_id from the reservation details
        const guestResponse = await axios.get(`https://light-house-system.vercel.app/api/getGuestDetails`, {
          params: { guest_id: reservationData.guest_id },
          headers: {
            Authorization: `Bearer ${token}` // Attach the token for guest details as well
          }
        });

        setGuestInfo(guestResponse.data);
      } catch (error) {
        setError('Failed to load reservation details.');
        console.error('Error fetching reservation details:', error);
      }
    };

    fetchReservationDetails();
  }, [room_reservation_id]);

  const handleCancel = async () => {
    try {
      const response = await axios.post('https://light-house-system.vercel.app/api/cancelReservation', {
        room_reservation_id,       
        cancel_reason: cancelReason 
      });

      alert('Reservation cancelled successfully.');
      setIsModalOpen(false); 
    } catch (error) {
      alert('Failed to cancel the reservation.');
      console.error('Error cancelling reservation:', error);
    }
  };

  if (error) {
    return <div className="notification is-danger">{error}</div>;
  }

  if (!reservationDetails || !guestInfo) {
    return <div>Loading...</div>;
  }

  const isCancelable = reservationDetails.reservation_status !== 'CANCELED' && reservationDetails.reservation_status !== 'COMPLETED' && reservationDetails.reservation_status !== 'NO SHOW';

  return (
    <section className='section-m1'>
      <div className='box section-p1 m-2'>
        <div className="field mb-4">
          <Link to="/reservations" className="button is-blue">
            <IoArrowBackOutline className='mr-2' />
            Back
          </Link>
        </div>
        <div className="columns">
          {/* Guest Information Section */}
          <div className="column is-one-third">
            <div className="field">
              <label className="subtitle">Guest Information</label>
            </div>
            <div className="field">
              <label className="label">ID:</label>
              <p>{guestInfo.guest_id || 'N/A'}</p>
            </div>
            <div className="field">
              <label className="label">First Name:</label>
              <p>{guestInfo.guest_fname || 'N/A'}</p>
            </div>
            <div className="field">
              <label className="label">Last Name:</label>
              <p>{guestInfo.guest_lname || 'N/A'}</p>
            </div>
            <div className="field">
              <label className="label">Address:</label>
              <p>{guestInfo.guest_address || 'N/A'}</p>
            </div>
            <div className="field">
              <label className="label">Country:</label>
              <p>{guestInfo.guest_country || 'N/A'}</p>
            </div>
            <div className="field">
              <label className="label">Contact Number:</label>
              <p>{guestInfo.guest_phone_no || 'N/A'}</p>
            </div>
          </div>

          {/* Reservation Information Section */}
          <div className="column is-one-third">
            <div className="field">
              <label className="subtitle">Reservation Info</label>
            </div>
            <div className="field">
              <label className="label">Check-In Date:</label>
              <p>{new Date(reservationDetails.room_check_in_date).toLocaleDateString()}</p>
            </div>
            <div className="field">
              <label className="label">Check-Out Date:</label>
              <p>{new Date(reservationDetails.room_check_out_date).toLocaleDateString()}</p>
            </div>
            <div className="field">
              <label className="label">Total Cost:</label>
              <p>₱{reservationDetails.total_cost || 'N/A'}</p>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="column is-one-third">
            <div className="field">
              <label className="subtitle">Booking Summary</label>
            </div>
            <div className="field">
              <label className="label">Room Type:</label>
              <p>{reservationDetails.room_type_name}</p>
            </div>
            <div className="field">
              <label className="label">Room Number:</label>
              <p>{reservationDetails.room_number}</p>
            </div>
            <div className="field">
              <label className="label">Number of Guests:</label>
              <p>{reservationDetails.room_pax || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Cancel Button - only show if reservation is not CANCELED or COMPLETED */}
        {isCancelable && (
          <div className="field is-flex is-justify-content-flex-end">
            <button className="button is-danger" onClick={() => setIsModalOpen(true)}>Cancel Reservation</button>
          </div>
        )}
      </div>

      {/* Modal for Cancellation */}
      {isModalOpen && (
        <div className="modal is-active">
          <div className="modal-background" onClick={() => setIsModalOpen(false)}></div>
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">Cancel Reservation</p>
              <button className="delete" onClick={() => setIsModalOpen(false)}></button>
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
              <button className="button is-danger m-1" onClick={handleCancel}>Confirm Cancellation</button>
              <button className="button m-1" onClick={() => setIsModalOpen(false)}>Cancel</button>
            </footer>
          </div>
        </div>
      )}
    </section>
  );
};

export default ReservationsRoomDetails;
