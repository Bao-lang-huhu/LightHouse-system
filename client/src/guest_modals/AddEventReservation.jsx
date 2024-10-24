import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Link } from 'react-router-dom';
import './modal.css';
import { IoHelpCircle, IoPersonCircleOutline, IoWarning } from 'react-icons/io5';
import SuccessModal from '../messages/successModal';
import ErrorModal from '../messages/errorModal';
import { Snackbar, Alert } from '@mui/material';

const AddEventReservation = ({ isOpen, toggleModal}) => {
    const [venues, setVenues] = useState([]);
    const [foodPackages, setFoodPackages] = useState([]);
    const [foodItems, setFoodItems] = useState([]);
    const [guestDetails, setGuestDetails] = useState(null);
    const [selectedVenueId, setSelectedVenueId] = useState('');
    const [selectedFoodPackageId, setSelectedFoodPackageId] = useState('');
    const [maxGuests, setMaxGuests] = useState(0);
    const [foodPackageLimits, setFoodPackageLimits] = useState({});
    const [selectedFoodItems, setSelectedFoodItems] = useState({});
    const [eventDetails, setEventDetails] = useState({
        event_name: '',
        event_type: '',
        event_date: '',
        event_start_time: '',
        event_end_time: '',
        event_no_guest: '',
        event_is_dpay: false,
        event_downpayment: '',
        event_total_price: ''
    });
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: ' ', 
    });
    const [totalCost, setTotalCost] = useState(0); 
    const [termsAccepted, setTermsAccepted] = useState(false); 
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [guestError, setGuestError] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [showSuccessModal, setShowSuccessModal] = useState(false); 
    const [showErrorModal, setShowErrorModal] = useState(false);


    useEffect(() => {
        if (isOpen) {
            setShowSuccessModal(false);  // Reset success modal
            setShowErrorModal(false);    // Reset error modal
            fetchActiveVenuesAndPackages();
            fetchGuestDetails();
            fetchFoodItems();
    
            const storedDate = localStorage.getItem('event_date');
            if (storedDate) {
                setEventDetails(prevDetails => ({
                    ...prevDetails,
                    event_date: storedDate
                }));
            }
        }
    }, [isOpen]);
    

    const fetchActiveVenuesAndPackages = async () => {
        try {
            const venuesResponse = await axios.get('http://localhost:3001/api/getActiveVenues');
            const foodPackagesResponse = await axios.get('http://localhost:3001/api/getActiveFoodPackages');
            setVenues(venuesResponse.data);
            setFoodPackages(foodPackagesResponse.data);
        } catch (error) {
            setErrorMessage('Error fetching venues and food packages.');
        }
    };

    const fetchFoodItems = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/getFoodItems');
            const filteredItems = response.data.filter(item => item.food_service_category === 'BOTH' || item.food_service_category === 'EVENT');
            setFoodItems(filteredItems);
        } catch (error) {
            setErrorMessage('Error fetching food items.');
        }
    };

    const fetchGuestDetails = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsLoggedIn(false); 
            return;
        }

        try {
            const decodedToken = jwtDecode(token);
            const guest_id = decodedToken.guest_id;

            const response = await axios.get('http://localhost:3001/api/getGuestDetails', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGuestDetails(response.data);
            setIsLoggedIn(true); 
        } catch (error) {
            setErrorMessage('Error fetching guest details.');
            setIsLoggedIn(false);
        }
    };

    const handleVenueChange = (e) => {
        const selectedVenue = venues.find(venue => venue.event_venue_id === e.target.value);
        setSelectedVenueId(e.target.value);
        setMaxGuests(selectedVenue ? selectedVenue.venue_max_pax : 0);
    
        if (selectedVenue) {
            const venueCost = selectedVenue.venue_final_price || 0;
            const foodCost = selectedFoodPackageId
                ? foodPackages.find(pkg => pkg.event_fd_pckg_id === selectedFoodPackageId).event_fd_pckg_final_price || 0
                : 0;
            calculateTotalCost(venueCost, foodCost);
        }
    };

    const handleFoodPackageChange = (e) => {
        const selectedPackage = foodPackages.find(pkg => pkg.event_fd_pckg_id === e.target.value);
        setSelectedFoodPackageId(e.target.value);
    
        if (selectedPackage) {
            setFoodPackageLimits({
                mainDishLimit: selectedPackage.event_fd_main_dish_lmt,
                pastaLimit: selectedPackage.event_fd_pasta_lmt,
                dessertLimit: selectedPackage.event_fd_dessert_lmt,
                drinksLimit: selectedPackage.event_fd_drinks_lmt
            });
    
            const foodCost = selectedPackage.event_fd_pckg_final_price || 0;
            const venueCost = selectedVenueId
                ? venues.find(venue => venue.event_venue_id === selectedVenueId).venue_final_price || 0
                : 0;
            calculateTotalCost(venueCost, foodCost);
        }
    };

    const handleFoodSelection = (e, field) => {
        const value = e.target.value;
        setSelectedFoodItems(prevItems => ({
            ...prevItems,
            [field]: value
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEventDetails(prevDetails => ({
            ...prevDetails,
            [name]: value
        }));
    
        if (name === 'event_start_time') {
            const [hours, minutes] = value.split(':');
            let endHours = parseInt(hours, 10) + 5;
    
            const formattedStartHours = hours.padStart(2, '0');
            const formattedStartMinutes = minutes.padStart(2, '0');
            
            let endTime = `${endHours > 23 ? (endHours - 24).toString().padStart(2, '0') : endHours.toString().padStart(2, '0')}:${formattedStartMinutes}`;
            
            setEventDetails(prevDetails => ({
                ...prevDetails,
                event_start_time: `${formattedStartHours}:${formattedStartMinutes}`,  // Ensure start time is correctly formatted
                event_end_time: endTime  // Ensure end time is correctly formatted
            }));
        }
    
        if (name === 'event_no_guest' && value === '') {
            setGuestError('Number of guests is required.');
        } else if (name === 'event_no_guest' && parseInt(value, 10) > maxGuests) {
            setGuestError(`Number of guests cannot exceed the venue capacity of ${maxGuests}.`);
        } else {
            setGuestError(''); // Clear error when input is valid
        }
    };
    

    const calculateTotalCost = (venueFinalPrice, foodPackageFinalPrice) => {
        const venueCost = parseFloat(venueFinalPrice) || 0;
        const foodCost = parseFloat(foodPackageFinalPrice) || 0;
        const total = venueCost + foodCost;
    
        setTotalCost(total);
        setEventDetails(prevDetails => ({
            ...prevDetails,
            event_total_price: total
        }));
    };
    

    const handleSubmit = async () => {
        // Clear previous notification state
        setNotification({ open: false, message: '', severity: '' });
    
        // Validate required fields
        if (!eventDetails.event_name || !eventDetails.event_type || !eventDetails.event_date || 
            !eventDetails.event_start_time || !selectedVenueId || !selectedFoodPackageId || 
            !eventDetails.event_no_guest || parseInt(eventDetails.event_no_guest, 10) > maxGuests) {
            setNotification({
                open: true,
                message: 'Please fill out all required fields and ensure the number of guests does not exceed the venue capacity.',
                severity: 'error'
            });
            return;
        }
    
        if (!termsAccepted) {
            setNotification({
                open: true,
                message: 'You must accept the Terms and Conditions before proceeding.',
                severity: 'error'
            });
            return;
        }
    
        try {
            const token = localStorage.getItem('token');
            const decodedToken = jwtDecode(token);
            const guest_id = decodedToken.guest_id;
    
            const response = await axios.post('http://localhost:3001/api/registerEventReservation', {
                ...eventDetails,
                event_venue_id: selectedVenueId,
                event_fd_pckg_id: selectedFoodPackageId,
                guest_id,
                selectedFoodItems
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            if (response.status === 201 || response.status === 200) {
                // Show success notification
                setNotification({
                    open: true,
                    message: 'Event reservation successfully created!',
                    severity: 'success'
                });
                setShowSuccessModal(true);  // Show the success modal
            }
    
        } catch (error) {
            console.error('Error registering event:', error.response?.data || error.message);
            // Show error notification
            setNotification({
                open: true,
                message: 'Failed to create event reservation. Please try again.',
                severity: 'error'
            });
            setShowErrorModal(true);  // Show the error modal
        }
    };
    
    

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false); // Close success modal
    
        // Reset form and event details after the success modal is closed
        setEventDetails({
            event_name: '',
            event_type: '',
            event_date: '',
            event_start_time: '',
            event_end_time: '',
            event_no_guest: '',
            event_is_dpay: false,
            event_downpayment: '',
            event_total_price: ''
        });
        setSelectedVenueId('');
        setSelectedFoodPackageId('');
        setSelectedFoodItems({});
        setFoodPackageLimits({});
        setMaxGuests(0);
    
        // Optional: You can close the modal too if needed
        toggleModal();  
    };
    

    

    const renderFoodDropdown = (category, limit) => {
        const categoryItems = foodItems.filter(item => item.food_category_name === category.toUpperCase());
        return [...Array(limit)].map((_, index) => {
            const field = `${category.toUpperCase()}${index + 1}`;
            return (
                <div key={index} className="field">
                    <label className="label">Select {category} {index + 1}</label>
                    <div className="select is-fullwidth ml-3">
                        <select onChange={(e) => handleFoodSelection(e, field)} value={selectedFoodItems[field]}>
                            <option value="">Select {category}</option>
                            {categoryItems.map(food => (
                                <option key={food.food_id} value={food.food_id}>
                                    {food.food_name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            );
        });
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    const resetForm = () => {
        setEventDetails({
            event_name: '',
            event_type: '',
            event_date: '',
            event_start_time: '',
            event_end_time: '',
            event_no_guest: '',
            event_is_dpay: false,
            event_downpayment: '',
            event_total_price: ''
        });
        setSelectedVenueId('');
        setSelectedFoodPackageId('');
        setSelectedFoodItems({});
        setFoodPackageLimits({});
        setMaxGuests(0);
        setGuestError('');
        setTermsAccepted(false);
        setNotification({ open: false, message: '', severity: '' });
        setTotalCost(0);
    };
    
    const handleCloseModal = () => {
        resetForm();  // Reset inputs
        toggleModal(); // Close the modal
    };

    return (
        <div className={`modal ${isOpen ? 'is-active' : ''}`}>
            <div className="modal-background" onClick={toggleModal}></div>
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Event Reservation</p>
                    <button className="delete" aria-label="close" onClick={handleCloseModal}></button>
                </header>
                <section className="modal-card-body">
                    {guestDetails && (
                        <div className="field">
                            <label className="label fonting-label">Guest Name</label>
                            <p className='fonting-p'><IoPersonCircleOutline className='mr-3'/>{guestDetails.guest_fname} {guestDetails.guest_lname}</p>
                        </div>
                    )}

                    <div className="field">
                        <label className="label">Event Name</label>
                        <input className="input ml-3" type="text" name="event_name" value={eventDetails.event_name}  onChange={handleInputChange} />
                    </div>

                    <div className="field">
                        <label className="label">Event Type</label>
                        <div className="select is-fullwidth ml-3">
                            <select name="event_type" value={eventDetails.event_type} onChange={handleInputChange}>
                                <option>Select event type</option>
                                <option value="WEDDING">WEDDING</option>
                                <option value="BIRTHDAY">BIRTHDAY</option>
                                <option value="GALA">GALA</option>
                                <option value="SEMINAR">SEMINAR</option>
                                <option value="EXHIBITION">EXHIBITION</option>
                                <option value="FIESTA">FIESTA</option>
                                <option value="ANNIVERSARY">ANNIVERSARY</option>
                                <option value="VALENTINES">VALENTINES</option>
                                <option value="CHRISTMAS">CHRISTMAS</option>


                            </select>
                        </div>
                    </div>

                    <div className="field">
                        <label className="label">Event Date</label>
                        <div className='ml-3'>
                            <p>{eventDetails.event_date}</p>
                        </div>
                    </div>
                    <label className="label">Event Time</label>
                    <div className='ml-3'>
                        <p className="help"><IoHelpCircle className='mr-2'/>Enter the start time, and the end time will be automatically generated. </p>
                        <div className="columns">
                            <div className="column">
                                <label className="label">Start Time</label>
                                <input className="input" type="time" name="event_start_time" onChange={handleInputChange} value={eventDetails.event_start_time}/>
                                <p className="help"><IoWarning className='mr-2'/>Maximum 5 hours allowed for event duration.</p>
                            </div>
                            <div className="column">
                                <label className="label">End Time</label>
                                <input className="input" type="time" name="event_end_time" value={eventDetails.event_end_time} readOnly  />
                            </div>
                        </div>
                    </div>

                    <div className="field">
                        <label className="label">Venue</label>
                        <div className='ml-3'>
                        {venues.map((venue) => (
                            <div key={venue.event_venue_id} className="control mr-3">
                                <label className="radio ">
                                    <input
                                        type="radio"
                                        name="venue"
                                        className='mr-2'
                                        value={venue.event_venue_id}
                                        checked={selectedVenueId === venue.event_venue_id}
                                        onChange={handleVenueChange}
                                    />
                                    {venue.venue_name} (Max Guests: {venue.venue_max_pax}) - Price : {venue.venue_final_price}
                                </label>
                            </div>
                        ))}
                    </div>
                    </div>

                    <div className="field">
                    <label className="label">Number of Guests</label>
                    <div className='ml-3'>
                        <input
                            className="input"
                            type="number"
                            name="event_no_guest"
                            value={eventDetails.event_no_guest}
                            max={maxGuests}
                            required
                            min={20} // Set minimum to 20
                            onChange={handleInputChange}
                            placeholder={`Enter number of guests (Max ${maxGuests})`}
                        />
                    {guestError && <p className="help is-danger">{guestError}</p>}
                    </div>
                </div>

                    <div className="field">
                        <label className="label">Food Package</label>
                        <div className='ml-3'>
                        {foodPackages.map((pkg) => (
                            <div key={pkg.event_fd_pckg_id} className="control  mr-3">
                                <label className="radio">
                                    <input
                                        type="radio"
                                        className='mr-2'
                                        name="foodPackage"
                                        checked={selectedFoodPackageId === pkg.event_fd_pckg_id}
                                        value={pkg.event_fd_pckg_id}
                                        onChange={handleFoodPackageChange}
                                    />
                                    {pkg.event_fd_pckg_name} (Price: {pkg.event_fd_pckg_final_price})
                                </label>
                            </div>
                        ))}
                    </div>
                    </div>

                    {foodPackageLimits.mainDishLimit && renderFoodDropdown('MAIN', foodPackageLimits.mainDishLimit)}
                    {foodPackageLimits.pastaLimit && renderFoodDropdown('PASTA', foodPackageLimits.pastaLimit)}
                    {foodPackageLimits.dessertLimit && renderFoodDropdown('DESSERT', foodPackageLimits.dessertLimit)}
                    {foodPackageLimits.drinksLimit && renderFoodDropdown('DRINK', foodPackageLimits.drinksLimit)}
                    <div className='box is-inverted-blue-back'>
                        <div className="field">
                            <label className="label">Total Cost</label>
                            <p className="has-text-weight-bold is-size-4"> ₱{!isNaN(totalCost) ? totalCost.toFixed(2) : '0.00'}</p>
                        </div>
                    </div>

                  {/* Terms and Conditions */}
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

                <Snackbar
                open={notification.open}
                autoHideDuration={3000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} 
                sx={{ width: '500px' }}>
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    style={{ fontSize: '1.2rem', padding: '20px' }} >
                    {notification.message}
                </Alert>
            </Snackbar>

                <SuccessModal isOpen={showSuccessModal} toggleModal={handleSuccessModalClose} />

                <ErrorModal isOpen={showErrorModal} toggleModal={() => setShowErrorModal(false)} />

                </section>
                <footer className="modal-card-foot is-flex is-justify-content-flex-end is-align-items-center" style={{ backgroundColor: '#f7f9fc' }}>
                    {isLoggedIn ? (
                        // Show "Save" and "Cancel" buttons if the user is logged in
                        <>
                            <button className="button is-blue mr-2" onClick={handleSubmit}>Save</button>
                            <button className="button is-inverted-blue" onClick={handleCloseModal}>Cancel</button>
                        </>
                    ) : (
                        // Show "Sign In" and "Cancel" buttons if the user is not logged in
                        <>
                            <Link to="/login" className="button is-blue mr-2">Sign In for Reservation</Link>
                        </>
                    )}
                </footer>

                    </div>
        </div>
    );
};

export default AddEventReservation;
