import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import moment from 'moment';
import { IoTime } from 'react-icons/io5'; 
import { Snackbar, Alert } from '@mui/material';
import { IoArrowBackOutline } from 'react-icons/io5';

const ReservationsEventDetails = () => {
    const navigate = useNavigate(); 
    const [cancelReason, setCancelReason] = useState('');
    const { event_reservation_id } = useParams(); // Get the reservation ID from the URL
    const [reservation, setReservation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });


  const eventTypeImageMap = {
    ANNIVERSARY: 'https://drive.google.com/thumbnail?id=14KR2VE5iEFhoNC8tz74hmVkcxORo88Cm',
    SEMINAR: 'https://drive.google.com/thumbnail?id=14G5r32gM5RC3QwzpTN0vfQoPHwkTpLkZ',
    BIRTHDAY: 'https://drive.google.com/thumbnail?id=1ro7Ec0zUKKV1GUEbDxfZEDImeWud0Hwk',
    CHRISTMAS: 'https://drive.google.com/thumbnail?id=1IJU7R5zUvXG8a7F-jzqiVNSfBSMtF-86',
    EXHIBITION: 'https://drive.google.com/thumbnail?id=1O76yKqrpjnwnTU9HSQbPJC_7YmGdKuoU',
    FIESTA: 'https://drive.google.com/thumbnail?id=1slcPHbVjdqk6tchjBwL2v_sc5s1qgRc6',
    GALA: 'https://drive.google.com/thumbnail?id=1lgnH3G-4a-1mYkbVNN2CleYPyxIOMIb1',
    VALENTINES: 'https://drive.google.com/thumbnail?id=1Y23abUT7EiHPtyiOzrK2At7vbXk79kQ4',
    WEDDING: 'https://drive.google.com/thumbnail?id=1IqdDvMug6ht30F4SfDim3JFYAxFylMUf',
    DEFAULT: 'https://drive.google.com/thumbnail?id=1XH9p2H9kw1OuoLkiKuALlQnfLyfYI2HF',
  };
  

  const getEventImageUrl = (eventType) => {
    return eventTypeImageMap[eventType] || eventTypeImageMap.DEFAULT;
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ open: false, message: '', severity: 'success' });
  };

  useEffect(() => {
    const fetchReservationDetails = async () => {
      try {
        // Fetch all reservations
        const response = await axios.get('http://localhost:3001/api/getEventReservationsAll');
        console.log('API Response:', response.data);

        // Find the reservation with the matching event_reservation_id
        const matchedReservation = response.data.find(
          (res) => res.event_reservation_id === event_reservation_id
        );

        if (matchedReservation) {
          setReservation(matchedReservation); // Set the matched reservation data
        } else {
          setError('Reservation not found');
        }
      } catch (err) {
        console.error('Error fetching reservation details:', err);
        setError('Failed to load reservation details.');
      } finally {
        setLoading(false); // Stop loading once the data is fetched
      }
    };

    fetchReservationDetails();
  }, [event_reservation_id]);

  const handleCancel = async () => {
    try {
        await axios.post('http://localhost:3001/api/cancelEventReservation', {
            event_reservation_id,
            cancel_reason: cancelReason // Send cancel reason to backend
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


  const getDaysBeforeCheckIn = () => {
    if (!reservation) return 0;
    const today = new Date();
    const checkInDate = new Date(reservation.event_date);
    const diffInTime = checkInDate.getTime() - today.getTime();
    return Math.ceil(diffInTime / (1000 * 3600 * 24)); // Calculate days difference
  };

  const daysDifference = getDaysBeforeCheckIn();

  const isCancelable = () => {
    return daysDifference > 2 && reservation.reservation_status !== 'CANCELED' && reservation.reservation_status !== 'COMPLETED' && reservation.reservation_status !== 'NO SHOW';
  };

  if (loading) {
    return <p>Loading reservation details...</p>;
  }

  if (error) {
    return (
        <div className="box" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
            <div className="notification">{error}</div>
        </div>
    );
}

if (!reservation) {
    return (
        <div className="box" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
            <div className="notification">{error}</div>
        </div>
    );
}

  const eventImageUrl = getEventImageUrl(reservation.event_type);

  return (
    <div className="container">
      <Link to="/reservations">
        <button className="button is-blue mb-4">
          <IoArrowBackOutline className="mr-2" />
          Back to Reservations
        </button>
      </Link>
      <div className="columns is-multiline  p-5">
        <div 
          className="column is-half" 
          style={{
            backgroundImage: `url(${eventImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '0 100px 100px 0', // Rounded only on one side
            padding: '20px',
            color: 'white',
            opacity: 0.8 // Reduce the opacity of the background image slightly
          }}
        >
          <div className="box" 
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.8)', // Darker overlay
              padding: '20px', 
              borderRadius: '0 200px 200px 0',
            }}
          >
            <h2 className="title is-5 m-2">Guest Information</h2>
            <p>Name: <strong>{reservation.guest?.guest_fname || ''} {reservation.guest?.guest_lname || ''}</strong></p>
            <p>Email: <strong>{reservation.guest?.guest_email || 'N/A'}</strong></p>
            <p>Phone No: <strong>{reservation.guest?.guest_phone_no || 'N/A'}</strong></p>
            <p>Address: <strong>{reservation.guest?.guest_address || 'N/A'}</strong></p>
            <p>Country: <strong>{reservation.guest?.guest_country || 'N/A'}</strong></p>

            <h2 className="title is-5 m-2">Reservation Information</h2>
            <p>Event Name: <strong>{reservation.event_name || 'No Event Name'}</strong></p>
            <p>Event Type: <strong>{reservation.event_type || 'N/A'}</strong></p>
            <p>Event Date: <strong>{moment(reservation.event_date).format('YYYY-MM-DD')}</strong></p>
            <p>Time: <strong>{moment(reservation.event_start_time, 'HH:mm:ss').format('hh:mm A')} to {moment(reservation.event_end_time, 'HH:mm:ss').format('hh:mm A')}</strong></p>
            <p>Total Cost: <strong>₱{reservation.event_total_price || 'No Total Cost'}</strong></p>
            <p>No. of Guests: <strong>{reservation.event_no_guest || 'N/A'}</strong></p>
          </div>
        </div>

        {/* Venue and Food Package */}
        <div className="column is-half">
          <div className="box" style={{ backgroundColor: '#e5fff5' }}>
            <h2 className="title is-5 m-2">Venue and Food Package</h2>
            <p>Venue: <strong>{reservation.venue?.venue_name || 'N/A'}</strong></p>
            <p>Venue Price: <strong>₱{reservation.venue?.venue_price || 'N/A'}</strong></p>
            <p>Package Name: <strong>{reservation.foodPackage?.package_name || 'No Food Package Reserved'}</strong></p>
            <p>Package Price: <strong>₱{reservation.foodPackage?.package_price || 'N/A'}</strong></p>

            <h2 className="title is-5 m-2">Food Items</h2>
            {reservation.foodItems?.length > 0 ? (
              <table className="table is-striped is-fullwidth">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                  </tr>
                </thead>
                <tbody>
                  {reservation.foodItems.map((item, index) => (
                    <tr key={index}>
                      <td>{item.food_name}</td>
                      <td>{item.food_category_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No food items selected.</p>
            )}
          </div>
        </div>

      </div>  
      <p className='is-flex is-align-items-center label is-5 m-1' style={{ wordBreak: 'keep-all', whiteSpace: 'normal' }}>
            <IoTime className='mr-1 has-text-danger' />
                Cancellation is allowed 2 days remaining before the reservation date
        </p><div className="field is-flex is-justify-content-flex-end">
      {['CONFIRMED', 'PENDING'].includes(reservation.reservation_status) && (
                                                        daysDifference > 2 ? (

            
         
            
            <button className="button is-danger" onClick={() => setIsModalOpen(true)}
            style={{ wordBreak: 'keep-all', whiteSpace: 'normal', textAlign: 'center' }}>
              Cancel ({daysDifference} days before reservation)
            </button>
          ) : (
            <p className='has-text-danger'>You can only cancel reservations within 2 days of the check-in date. Current reservation cannot be canceled.</p>
          ))}

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
    </div>
  );
};

export default ReservationsEventDetails;
