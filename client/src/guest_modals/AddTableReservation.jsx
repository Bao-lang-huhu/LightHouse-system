import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'; // Use this to navigate to another page
import 'bulma/css/bulma.min.css';
import { IoPerson, IoReceipt } from 'react-icons/io5';
import { Snackbar, Alert } from '@mui/material';
import SuccessModal from '../messages/successModal';
import ErrorModal from '../messages/errorModal';

const AddTableReservation = ({ isOpen, toggleModal }) => {
    const [selectedTableId, setSelectedTableId] = useState('');
    const [selectedTableName, setSelectedTableName] = useState('');
    const [reservationDate, setReservationDate] = useState('');
    const [reservationTime, setReservationTime] = useState('');
    const [numberOfGuests, setNumberOfGuests] = useState('');
    const [guestInfo, setGuestInfo] = useState({});
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [termsAccepted, setTermsAccepted] = useState(false); 
    const [isSaving, setIsSaving] = useState(false); 
    const [isEditingGuests, setIsEditingGuests] = useState(false); 
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: ' ', 
    });
    const [showSuccessModal, setShowSuccessModal] = useState(false); 
    const [showErrorModal, setShowErrorModal] = useState(false);



    const handleGuestsChange = (e) => {
        setNumberOfGuests(e.target.value); // Update value as the user types
    };

    const handleSaveGuests = () => {
        // Validate before saving
        const guestCount = parseInt(numberOfGuests, 10);
        
        if (guestCount < 7 || guestCount > 15) {
            setNotification({
                open: true,
                severity: 'error',
                message: 'Number of guests must be between 7 and 15.'
            });
            return; // Prevent saving if validation fails
        }

        // Add your save logic here
        setIsEditingGuests(false); // Close edit mode if validation passes
    };

    
    const navigate = useNavigate(); // Hook for navigation

    useEffect(() => {
    
        const storedTableId = localStorage.getItem('selected_table_id');
        const storedTableName = localStorage.getItem('selected_table_name');
        const storedReservationDate = localStorage.getItem('table_reservation_date');
        const storedReservationTime = localStorage.getItem('table_reservation_time');
        const storedNumberOfGuests = localStorage.getItem('table_guest_quantity');
        
        if (storedTableId && storedTableName) {
            setSelectedTableId(storedTableId);
            setSelectedTableName(storedTableName);
        }
        if (storedReservationDate) setReservationDate(storedReservationDate);
        if (storedReservationTime) setReservationTime(storedReservationTime);
        if (storedNumberOfGuests) setNumberOfGuests(Number(storedNumberOfGuests)); // Ensure it's a number
    
        const fetchGuestDetails = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error("No token found.");
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get('http://localhost:3001/api/getGuestDetails', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setGuestInfo(response.data);
            } catch (error) {
                console.error('Error fetching guest details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGuestDetails();
    }, [isOpen]);

   
    const handleSave = async () => {
        if (isSaving || !termsAccepted) return; 
    
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setNotification({
                    open: true,
                    severity: 'error',
                    message: 'No token found, please login again.'
                });
                setIsSaving(false);
                return;
            }
    
            const adjustedDate = new Date(reservationDate);
            const localReservationDate = adjustedDate.toISOString().split('T')[0];
    
            const reservationDetails = {
                selectedTableId,
                reservationDate: localReservationDate,
                reservationTime,
                numberOfGuests,
                notes
            };
    
            const response = await axios.post('http://localhost:3001/api/registerTableReservation', reservationDetails, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            if (response.status === 201) {
                setNotification({
                    open: true,
                    severity: 'success',
                    message: 'Reservation created successfully!'
                });
                setShowSuccessModal(true); // Show success modal after reservation is saved
            }
        } catch (error) {
            setNotification({
                open: true,
                severity: 'error',
                message: 'Failed to create reservation. Please try again.'
            });
            setShowErrorModal(true); 

        } finally {
            setIsSaving(false);
        }
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };
    
    useEffect(() => {
        const storedReservationDate = localStorage.getItem('table_reservation_date');
        if (storedReservationDate) {
            // Create a new Date object to parse the stored date and adjust timezone correctly
            const parsedDate = new Date(storedReservationDate);
            setReservationDate(parsedDate.toISOString().split('T')[0]); // Keep date format consistent
        }
    }, [isOpen]);

    const formatDate = (date) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString(undefined, options);
    };

    const formatTime = (time) => {
        const hour = parseInt(time, 10);
        if (hour >= 9 && hour <= 11) return `${hour}:00 AM`;
        if (hour >= 2 && hour <= 5) return `${hour}:00 PM`;
        return time;
    };
    
    
    

    return (
        <div className={`modal ${isOpen ? 'is-active' : ''}`}>
        <div className="modal-background" onClick={toggleModal}></div>
        <div className="modal-card" style={{ borderRadius: '12px', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)' }}>
            <header className="modal-card-head" style={{ backgroundColor: '#f7f9fc', borderBottom: 'none' }}>
                <p className="modal-card-title" style={{ fontFamily: 'Montserrat, sans-serif', color: '#2c3e50' }}>
                    Restaurant Table Booking Review
                </p>
                <button className="delete" aria-label="close" onClick={toggleModal}></button>
            </header>
            <section className="modal-card-body" style={{ padding: '2rem', backgroundColor: '#fff' }}>
                {loading ? (
                    <div className="has-text-centered">Loading guest information...</div>
                ) : (
                    <>
                        {/* Guest Information */}
                        <div className="box" style={{ marginBottom: '2rem', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '1.5rem' }}>
                            <div className="field">
                                <label className="subtitle" style={{ color: '#2c3e50', fontWeight: '600' }}><IoPerson className='mr-2'/>Guest Information</label>
                            </div>

                            {/* Two columns layout */}
                            <div className="columns">
                                <div className="column is-half">
                                    <div className="field">
                                        <label className="label" style={{ color: '#7f8c8d' }}>
                                            Name: <strong>{guestInfo.guest_fname}</strong> <strong>{guestInfo.guest_lname}</strong>
                                        </label>
                                    </div>
                                    <div className="field">
                                        <label className="label" style={{ color: '#7f8c8d' }}>
                                            Country: <strong>{guestInfo.guest_country}</strong>
                                        </label>
                                    </div>
                                </div>

                                <div className="column is-half">
                                    <div className="field">
                                        <label className="label" style={{ color: '#7f8c8d' }}>
                                            Address: <strong>{guestInfo.guest_address}</strong>
                                        </label>
                                    </div>
                                    <div className="field">
                                        <label className="label" style={{ color: '#7f8c8d' }}>
                                            Contact Number: <strong>{guestInfo.guest_phone_no}</strong>
                                        </label>
                                    </div>
                                </div>
                            </div>

                        </div>

    
                        {/* Table Reservation Information */}
                        <div className="box" style={{ border: '1px solid #e0e0e0', borderRadius: '10px', padding: '1.5rem' }}>
                            <div className="field">
                                <label className="subtitle" style={{ color: '#2c3e50', fontWeight: '600' }}>
                                    <IoReceipt className='mr-2' />Table Reservation Information
                                </label>
                            </div>
                            <div className="field">
                                <label className="label" style={{ color: '#7f8c8d' }}>
                                    Reservation Date: <strong>{formatDate(reservationDate)}</strong>
                                </label>
                            </div>
                            <div className="field">
                                <label className="label" style={{ color: '#7f8c8d' }}>
                                    Reservation Time: <strong>{formatTime(reservationTime)}</strong>
                                </label>
                            </div>
                            <div className="field">
                                <label className="label" style={{ color: '#7f8c8d' }}>
                                    Reserved Table: <strong>{selectedTableName}</strong>
                                </label>
                            </div>
                            <div className="field">
                                <label className="label" style={{ color: '#7f8c8d' }}>
                                    Number of Guests:
                                </label>
                                <p className='is-size-6 ml-4' style={{ color: '#7f8c8d' }}>For large groups: the maximum limit is 15 guests.</p>
                                <div className="control">
                                    {isEditingGuests ? (
                                        <div className="buttons has-addons">
                                            {/* Decrease button */}
                                            <button 
                                                className="button is-blue" 
                                                onClick={() => setNumberOfGuests(prev => Math.max(7, prev - 1))}
                                                disabled={numberOfGuests <= 7}
                                            >
                                                -
                                            </button>
                                            
                                            {/* Display current number of guests */}
                                            <span className="button is-static">{numberOfGuests} Guests</span>
                                            
                                            {/* Increase button */}
                                            <button 
                                                className="button is-blue" 
                                                onClick={() => setNumberOfGuests(prev => Math.min(15, prev + 1))}
                                                disabled={numberOfGuests >= 15}
                                            >
                                                +
                                            </button>
                                            
                                            {/* Save button */}
                                            <button className="button is-inverted-blue ml-2" onClick={handleSaveGuests}>Save</button>
                                        </div>
                                    ) : (
                                        <>
                                            <strong>{numberOfGuests} Guests</strong>
                                            {parseInt(numberOfGuests, 10) >= 7 && (
                                                <button className="button is-blue is-small ml-2" onClick={() => setIsEditingGuests(true)}>
                                                    Edit
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>



                            <div className="field">
                                <label className="label" style={{ color: '#7f8c8d' }}>Notes</label>
                                <textarea
                                    className="textarea"
                                    style={{ border: '1px solid #7f8c8d', borderRadius: '8px' }}
                                    placeholder="Enter notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                    </>
                )}

            <Snackbar
                open={notification.open}
                autoHideDuration={3000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} 
                sx={{ width: '400px' }}>
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    style={{ fontSize: '1.2rem', padding: '20px' }} >
                    {notification.message}
                </Alert>
            </Snackbar>
    
                <div className="field mt-5">
                    <label className="label" style={{ color: '#2c3e50' }}>
                        Please review and agree to our Terms and Conditions, Data Policy, and Cancellation Policy before proceeding with your reservation.
                    </label>
                    <div className="control">
                        <label className="checkbox" style={{ color: '#7f8c8d' }}>
                            <input
                                type="checkbox"
                                checked={termsAccepted}
                                onChange={(e) => setTermsAccepted(e.target.checked)}
                            />{' '}I agree to the <Link to="/terms_and_conditions" style={{ textDecoration: 'underline' }}>Terms and Conditions</Link>, <Link to="/cancel_policy" style={{ textDecoration: 'underline' }}>Cancellation Policy</Link> and <Link to="/website_data_policy" style={{ textDecoration: 'underline' }}>Data Policy</Link>
                        </label>
                    </div>
                </div>
            </section>
    
            <footer className="modal-card-foot is-flex is-justify-content-flex-end is-align-items-center" style={{ backgroundColor: '#f7f9fc' }}>
                <button
                    className="button is-blue mr-2"
                    onClick={handleSave}
                    disabled={!termsAccepted || isSaving}
                >
                    {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                    className="button is-inverted-blue"
                    onClick={toggleModal}
                    disabled={isSaving}
                >
                    Cancel
                </button>
            </footer>
            <SuccessModal isOpen={showSuccessModal} toggleModal={() => setShowSuccessModal(false)} />
            <ErrorModal isOpen={showErrorModal} toggleModal={() => setShowErrorModal(false)} />

        </div>
    </div>
    

    );
};

export default AddTableReservation;
