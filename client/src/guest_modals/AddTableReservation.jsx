import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'; // Use this to navigate to another page
import 'bulma/css/bulma.min.css';

const AddTableReservation = ({ isOpen, toggleModal }) => {
    const [selectedTableId, setSelectedTableId] = useState('');
    const [selectedTableName, setSelectedTableName] = useState('');
    const [reservationDate, setReservationDate] = useState('');
    const [reservationTime, setReservationTime] = useState('');
    const [numberOfGuests, setNumberOfGuests] = useState('');
    const [guestInfo, setGuestInfo] = useState({});
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [termsAccepted, setTermsAccepted] = useState(false); // State for terms and conditions checkbox
    const [isSaving, setIsSaving] = useState(false); // State for saving

    const navigate = useNavigate(); // Hook for navigation

    useEffect(() => {
        // Retrieve stored data
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
        if (storedNumberOfGuests) setNumberOfGuests(storedNumberOfGuests);

        // Fetch guest details
        const fetchGuestDetails = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error("No token found.");
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get('https://light-house-system-h74t-server.vercel.app/api/getGuestDetails', {
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
        if (isSaving || !termsAccepted) return; // Prevent saving if it's already in progress or terms not accepted
    
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error("No token found.");
                setIsSaving(false);
                return;
            }
    
            // Parse the reservationDate from localStorage correctly (make sure it's local time)
            const adjustedDate = new Date(reservationDate);
            const localReservationDate = adjustedDate.toISOString().split('T')[0]; // Get YYYY-MM-DD format in local time
    
            const reservationDetails = {
                selectedTableId,
                reservationDate: localReservationDate, // Send the corrected date
                reservationTime,
                numberOfGuests,
                notes
            };
    
            const response = await axios.post('https://light-house-system-h74t-server.vercel.app/api/registerTableReservation', reservationDetails, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
    
            if (response.status === 201) {
                console.log('Reservation created successfully:', response.data);
                // Navigate back to the restaurant filtering page after successful save
                navigate('/resturant_filtering');
            }
        } catch (error) {
            console.error('Error creating reservation:', error);
        } finally {
            setIsSaving(false);
        }
    };
    
    // Ensuring correct date format for the frontend display:
    useEffect(() => {
        const storedReservationDate = localStorage.getItem('table_reservation_date');
        if (storedReservationDate) {
            // Create a new Date object to parse the stored date and adjust timezone correctly
            const parsedDate = new Date(storedReservationDate);
            setReservationDate(parsedDate.toISOString().split('T')[0]); // Keep date format consistent
        }
    }, [isOpen]);
    

    return (
        <div className={`modal ${isOpen ? 'is-active' : ''}`}>
            <div className="modal-background" onClick={toggleModal}></div>
            <div className="modal-card custom-modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Restaurant Table Booking Review</p>
                    <button className="delete" aria-label="close" onClick={toggleModal}></button>
                </header>
                <section className="modal-card-body">
                    {loading ? (
                        <div className="has-text-centered">Loading guest information...</div>
                    ) : (
                        <div className="columns">
                            <div className="column is-half">
                                <div className="field">
                                    <label className="subtitle">Guest Information</label>
                                </div>
                                <div className="field">
                                    <label className="label">Name:</label>
                                    <p>{guestInfo.guest_fname} {guestInfo.guest_lname}</p>
                                </div>
                                <div className="field">
                                    <label className="label">Address:</label>
                                    <p>{guestInfo.guest_address}</p>
                                </div>
                                <div className="field">
                                    <label className="label">Country:</label>
                                    <p>{guestInfo.guest_country}</p>
                                </div>
                                <div className="field">
                                    <label className="label">Contact Number:</label>
                                    <p>{guestInfo.guest_phone_no}</p>
                                </div>
                            </div>

                            <div className="column is-half">
                                <div className="field">
                                    <label className="subtitle">Table Reservation Information</label>
                                </div>
                                <div className="field">
                                    <label className="label">Reservation Date:</label>
                                    <p>{reservationDate}</p>
                                </div>
                                <div className="field">
                                    <label className="label">Reservation Time:</label>
                                    <p>{reservationTime}</p>
                                </div>
                                <div className="field">
                                    <label className="label">Reserved Table:</label>
                                    <p>{selectedTableName} (ID: {selectedTableId})</p>
                                </div>
                                <div className="field">
                                    <label className="label">Number of Guests:</label>
                                    <p>{numberOfGuests}</p>
                                </div>
                                <div className="field">
                                    <label className="label">Notes</label>
                                    <textarea
                                        className="textarea"
                                        placeholder="Enter notes"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="field mt-5">
                        <label className="label">
                            Please review and agree to our Terms and Conditions, Data Policy, and Cancellation Policy before proceeding with your reservation.
                        </label>
                        <div className="control">
                            <label className="checkbox">
                                <input
                                    type="checkbox"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                />{' '}
                                I agree to the <Link to="/terms_and_conditions">Terms and Conditions</Link>, <Link to="/cancel_policy">Cancellation Policy</Link> and <Link to="/website_data_policy">Data Policy</Link>                            </label>
                        </div>
                    </div>
                </section>

                <footer className="modal-card-foot is-flex is-justify-content-flex-end is-align-items-center">
                    <button
                        className="button is-blue mr-2"
                        onClick={handleSave}
                        disabled={!termsAccepted || isSaving} // Disable if terms not accepted or saving in progress
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button className="button is-red" onClick={toggleModal} disabled={isSaving}>
                        Cancel
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default AddTableReservation;
