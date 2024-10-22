import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom'; 
import { IoArrowBackOutline, IoTime } from 'react-icons/io5'; 
import axios from 'axios';
import '../App.css';
import { Snackbar, Alert } from '@mui/material';
import { ClipLoader } from 'react-spinners';


const ReservationsRoomDetails = () => {
  const navigate = useNavigate(); 
  const { room_reservation_id } = useParams(); 
  const [reservationDetails, setReservationDetails] = useState(null);
  const [guestInfo, setGuestInfo] = useState(null);
  const [mainImage, setMainImage] = useState(''); // For main image display
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [cancelReason, setCancelReason] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchReservationDetails = async () => {
      try {
        const token = localStorage.getItem('token'); 

        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get(`http://localhost:3001/api/getReservationsByReservationId`, {
          params: { room_reservation_id },
          headers: {
            Authorization: `Bearer ${token}` 
          }
        });

        const reservationData = response.data[0];
        setReservationDetails(reservationData);

        // Set the initial main image
        if (reservationData.images && reservationData.images.main) {
          setMainImage(reservationData.images.main);
        }

        const guestResponse = await axios.get(`http://localhost:3001/api/getGuestDetails`, {
          params: { guest_id: reservationData.guest_id },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setGuestInfo(guestResponse.data);
      } catch (error) {
        console.error('Error fetching reservation details:', error);

        if (error.response && error.response.status === 404) {
          setError('No table reservations found for your account.');
        } else if (error.response && error.response.status === 500){
          setError('Check your ethernet connectivity.');
        }
        else {
          setError('Failed to load reservations. ' + (error.message || ''));
        }
      }
      finally {
        setLoading(false); 
      }
    };

    fetchReservationDetails();
  }, [room_reservation_id]);

  const handleImageClick = (imageUrl) => {
    setMainImage(imageUrl); 
  };

  const handleCancel = async () => {
    try {
      await axios.post('http://localhost:3001/api/cancelReservation', {
        room_reservation_id,
        cancel_reason: cancelReason
      });

      setNotification({
        open: true,
        message: 'Reservation cancelled successfully.',
        severity: 'success',
      });

      setIsModalOpen(false);
      setCancelReason(''); // Clear the cancel reason

      // Navigate back to /reservations after a short delay to allow snackbar to show
      setTimeout(() => {
        navigate('/reservations');
      }, 500); // Adjust delay if needed
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to cancel the reservation.',
        severity: 'error',
      });
      console.error('Error cancelling reservation:', error);
    }
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ open: false, message: '', severity: 'success' });
  };
  
  
  if (error) {
    return (
        <div className="box" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
            <div className="notification">{error}</div>
        </div>
    );
}

  const getDaysBeforeCheckIn = () => {
    if (!reservationDetails) return 0;
    const today = new Date();
    const checkInDate = new Date(reservationDetails.room_check_in_date);
    const diffInTime = checkInDate.getTime() - today.getTime();
    return Math.ceil(diffInTime / (1000 * 3600 * 24)); // Calculate days difference
  };

  const daysDifference = getDaysBeforeCheckIn();

  const isCancelable = () => {
    return daysDifference > 2 && reservationDetails.reservation_status !== 'CANCELED' && reservationDetails.reservation_status !== 'COMPLETED' && reservationDetails.reservation_status !== 'NO SHOW';
  };

  return (
    <section className='section-m1'>
     
        <div className="field mb-4">
          <Link to="/reservations" className="button is-blue">
            <IoArrowBackOutline className='mr-2' />
            Back to Reservations
          </Link>
        </div>

        <div style={{ margin: '20px' }}>  
        {loading ? ( <div className="loader-container" style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
          <ClipLoader color="#007bff" size={50} />
        </div>
      ) : ( <>

      
          <div className="columns">
            {/* First Half: Room Photo Thumbnails */}
            <div className="column is-half">
              {/* Main image displayed */}
              <div className="box image-gallery-container">  
                {/* Main Image */}
                <div className="card-image main-image-container">
                  <figure className="image main-image">
                    <img 
                      src={mainImage || 'https://via.placeholder.com/600x400'} 
                      alt="Room"
                      className="main-img"
                      style={{ width: '100%', height: 'auto', borderRadius: '10px' }}
                    />
                  </figure>
                  
                </div>
                {/* Thumbnails */}
                <div className="thumbnails-container" style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {/* Main image displayed at the start of thumbnails */}
                  <figure className="image is-64x64">
                    <img
                      src={reservationDetails?.images?.main || 'https://via.placeholder.com/600x400'}
                      alt="Main Thumbnail"
                      onClick={() => handleImageClick(reservationDetails?.images?.main)}
                      className="thumbnail-img"
                      style={{ cursor: 'pointer', borderRadius: '8px', padding: '2px', border: '1px solid #ddd' }}
                    />
                  </figure>

                  {/* Extra images */}
                  {reservationDetails.images.extra && reservationDetails.images.extra.length > 0 ? (
                    reservationDetails.images.extra.map((image, idx) => (
                      <figure className="image is-64x64" key={idx}>
                        <img
                          src={image}
                          alt={`Thumbnail ${idx + 1}`}
                          onClick={() => handleImageClick(image)}
                          className="thumbnail-img"
                          style={{ cursor: 'pointer', borderRadius: '8px', padding: '2px', border: '1px solid #ddd' }}
                        />
                      </figure>
                    ))
                  ) : (
                    <p>No extra photos available</p>
                  )}
                </div>
                {/* Booking Summary */}
              <div className="field">
                <label className="subtitle">Booking Summary</label>
              </div>
              <div className="field">
                <label className="title">
                  {reservationDetails.room_type_name || 'N/A'}
                </label>
              </div>
              <div className="field">
                <label className="label is-size-4">
                  Room {reservationDetails.room_number || 'N/A'}
                </label>
              </div>
              <div className="field">
                <label className="label is-size-6">
                  <strong className='has-text-grey'>Number of Guests:</strong> {reservationDetails.room_pax || 'N/A'} guest/s
                </label>
              </div>
              
              </div>
            </div>

            {/* Second Half: Details and Information */}
            <div className="column is-half">
              {/* Guest Information Section */}
              
              <div className="field">
                <label className="subtitle">Guest Information</label>
                <p className='has-text-grey mr-1'>Here are the details of the guest associated with this reservation.</p>
              </div>
              <div className="field">
                <label className="label is-size-4">
                  {guestInfo.guest_fname || 'N/A'} {guestInfo.guest_lname || 'N/A'}
                </label>
              </div>
              <div className="field ml-2">
                <label className="label is-size-5">
                  <strong className='has-text-grey'>Address:</strong> {guestInfo.guest_address || 'N/A'}
                </label>
              </div>
              <div className="field ml-2">
                <label className="label is-size-5">
                  <strong className='has-text-grey'>Country:</strong> {guestInfo.guest_country || 'N/A'}
                </label>
              </div>
              <div className="field ml-2">
                <label className="label is-size-5">
                  <strong className='has-text-grey'>Contact Number:</strong> {guestInfo.guest_phone_no || 'N/A'}
                </label>
              </div>
              

              {/* Reservation Information Section */}
              <div className="field mt-3">
                <label className="subtitle">Reservation Information</label>
                <p className='has-text-grey mr-1'>Here are the details for the reservation you made.</p>
              </div>
              <div className="field ml-2">
                <label className="label is-size-5">
                  <strong className='has-text-grey'>Check-In Date:</strong> {new Date(reservationDetails.room_check_in_date).toLocaleDateString()}
                </label>
              </div>
              <div className="field ml-2">
                <label className="label is-size-5">
                  <strong className='has-text-grey'>Check-Out Date:</strong> {new Date(reservationDetails.room_check_out_date).toLocaleDateString()}
                </label>
              </div>
              <div className="field ml-2">
                <label className="label is-size-3">
                  <strong className='has-text-grey'>Total Cost:</strong> ₱{reservationDetails.total_cost || 'N/A'}
                </label>
              </div>  
            </div>
          </div>
        
          <p className='is-flex is-align-items-center label is-5 m-1' style={{ wordBreak: 'keep-all', whiteSpace: 'normal' }}>
            <IoTime className='mr-1 has-text-danger' />
                Cancellation is allowed 2 days remaining before the reservation date
        </p><div className="field is-flex is-justify-content-flex-end">
        {['CONFIRMED', 'PENDING'].includes(reservationDetails.reservation_status) && (
             daysDifference > 2 ? (
            
            <button className="button is-danger" onClick={() => setIsModalOpen(true)}
            style={{ wordBreak: 'keep-all', whiteSpace: 'normal', textAlign: 'center' }}>
              Cancel ({daysDifference} days before reservation)
            </button>
          ) : (
            <p className='has-text-danger'>You can only cancel reservations within 2 days of the check-in date. Current reservation cannot be canceled.</p>
          ))}

        </div>
        </>
            )}
        </div>
       
     

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
    </section>
  );
};

export default ReservationsRoomDetails;
