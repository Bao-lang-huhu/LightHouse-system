import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AddEventReservation = ({ isOpen, toggleModal }) => {
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

    const [totalCost, setTotalCost] = useState(0); // Track the total cost
    const [termsAccepted, setTermsAccepted] = useState(false); // Terms and conditions
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [guestError, setGuestError] = useState('');

    useEffect(() => {
        if (isOpen) {
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
            setErrorMessage('No token found.');
            return;
        }

        try {
            const decodedToken = jwtDecode(token);
            const guest_id = decodedToken.guest_id;

            const response = await axios.get('http://localhost:3001/api/getGuestDetails', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGuestDetails(response.data);
        } catch (error) {
            setErrorMessage('Error fetching guest details.');
        }
    };

    const handleVenueChange = (e) => {
        const selectedVenue = venues.find(venue => venue.event_venue_id === e.target.value);
        setSelectedVenueId(e.target.value);
        setMaxGuests(selectedVenue ? selectedVenue.venue_max_pax : 0);

        // Recalculate total cost
        if (selectedVenue && selectedFoodPackageId) {
            const selectedPackage = foodPackages.find(pkg => pkg.event_fd_pckg_id === selectedFoodPackageId);
            if (selectedPackage) {
                calculateTotalCost(selectedVenue.venue_final_price, selectedPackage.event_fd_pckg_final_price);
            }
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

            // Recalculate total cost
            if (selectedVenueId && selectedPackage) {
                const selectedVenue = venues.find(venue => venue.event_venue_id === selectedVenueId);
                if (selectedVenue) {
                    calculateTotalCost(selectedVenue.venue_final_price, selectedPackage.event_fd_pckg_final_price);
                }
            }

            // Initialize selectedFoodItems with limits
            const initialFoodItems = {};
            for (let i = 1; i <= selectedPackage.event_fd_main_dish_lmt; i++) {
                initialFoodItems[`MAIN${i}`] = '';
            }
            for (let i = 1; i <= selectedPackage.event_fd_pasta_lmt; i++) {
                initialFoodItems[`PASTA${i}`] = '';
            }
            for (let i = 1; i <= selectedPackage.event_fd_dessert_lmt; i++) {
                initialFoodItems[`DESSERT${i}`] = '';
            }
            for (let i = 1; i <= selectedPackage.event_fd_drinks_lmt; i++) {
                initialFoodItems[`DRINK${i}`] = '';
            }
            setSelectedFoodItems(initialFoodItems);
        }
    };

    const handleFoodSelection = (e, field) => {
        const value = e.target.value;
        setSelectedFoodItems(prevItems => ({
            ...prevItems,
            [field]: value
        }));
    };

    // Automatically calculate end time based on start time (max 5 hours duration)
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEventDetails(prevDetails => ({
            ...prevDetails,
            [name]: value
        }));

        if (name === 'event_start_time') {
            const [hours, minutes] = value.split(':');
            let endHours = parseInt(hours, 10) + 5;
            let endTime = `${endHours > 23 ? endHours - 24 : endHours}:${minutes}`;
            setEventDetails(prevDetails => ({
                ...prevDetails,
                event_end_time: endTime
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
        setErrorMessage('');
        setSuccessMessage('');

        if (!termsAccepted) {
            setErrorMessage('You must accept the Terms and Conditions before proceeding.');
            return;
        }

        if (parseInt(eventDetails.event_no_guest, 10) > maxGuests) {
            setErrorMessage(`The number of guests exceeds the venue capacity. Max allowed is ${maxGuests}.`);
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

            setSuccessMessage(response.data.message);
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
            toggleModal();
        } catch (error) {
            setErrorMessage('Error registering event.');
        }
    };

    const renderFoodDropdown = (category, limit) => {
        const categoryItems = foodItems.filter(item => item.food_category_name === category.toUpperCase());
        return [...Array(limit)].map((_, index) => {
            const field = `${category.toUpperCase()}${index + 1}`;
            return (
                <div key={index} className="field">
                    <label className="label">Select {category} {index + 1}</label>
                    <div className="select is-fullwidth">
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

    return (
        <div className={`modal ${isOpen ? 'is-active' : ''}`}>
            <div className="modal-background" onClick={toggleModal}></div>
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Event Reservation</p>
                    <button className="delete" aria-label="close" onClick={toggleModal}></button>
                </header>
                <section className="modal-card-body">
                    {guestDetails && (
                        <div className="field">
                            <label className="label">Guest Name</label>
                            <p>{guestDetails.guest_fname} {guestDetails.guest_lname}</p>
                        </div>
                    )}

                    <div className="field">
                        <label className="label">Event Name</label>
                        <input className="input" type="text" name="event_name" onChange={handleInputChange} />
                    </div>

                    <div className="field">
                        <label className="label">Event Type</label>
                        <div className="select is-fullwidth">
                            <select name="event_type" onChange={handleInputChange}>
                                <option>Select event type</option>
                                <option value="WEDDING">Wedding</option>
                                <option value="BIRTHDAY">Birthday</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="field">
                        <label className="label">Event Date</label>
                        <p>{eventDetails.event_date}</p>
                    </div>

                    <div className="columns">
                        <div className="column">
                            <label className="label">Start Time</label>
                            <input className="input" type="time" name="event_start_time" onChange={handleInputChange} />
                            <p className="help">Maximum 5 hours allowed for event duration.</p>
                        </div>
                        <div className="column">
                            <label className="label">End Time</label>
                            <input className="input" type="time" name="event_end_time" value={eventDetails.event_end_time} readOnly />
                        </div>
                    </div>

                    <div className="field">
                        <label className="label">Venue</label>
                        {venues.map((venue) => (
                            <div key={venue.event_venue_id} className="control">
                                <label className="radio">
                                    <input
                                        type="radio"
                                        name="venue"
                                        value={venue.event_venue_id}
                                        onChange={handleVenueChange}
                                    />
                                    {venue.venue_name} (Max Guests: {venue.venue_max_pax})
                                </label>
                            </div>
                        ))}
                    </div>

                    <div className="field">
                        <label className="label">Number of Guests</label>
                        <input
                            className="input"
                            type="number"
                            name="event_no_guest"
                            max={maxGuests}
                            required
                            onChange={handleInputChange}
                            placeholder={`Enter number of guests (Max ${maxGuests})`}
                        />
                         {guestError && <p className="help is-danger">{guestError}</p>}
                    </div>

                    <div className="field">
                        <label className="label">Food Package</label>
                        {foodPackages.map((pkg) => (
                            <div key={pkg.event_fd_pckg_id} className="control">
                                <label className="radio">
                                    <input
                                        type="radio"
                                        name="foodPackage"
                                        value={pkg.event_fd_pckg_id}
                                        onChange={handleFoodPackageChange}
                                    />
                                    {pkg.event_fd_pckg_name} (Price: {pkg.event_fd_pckg_final_price})
                                </label>
                            </div>
                        ))}
                    </div>

                    {foodPackageLimits.mainDishLimit && renderFoodDropdown('MAIN', foodPackageLimits.mainDishLimit)}
                    {foodPackageLimits.pastaLimit && renderFoodDropdown('PASTA', foodPackageLimits.pastaLimit)}
                    {foodPackageLimits.dessertLimit && renderFoodDropdown('DESSERT', foodPackageLimits.dessertLimit)}
                    {foodPackageLimits.drinksLimit && renderFoodDropdown('DRINK', foodPackageLimits.drinksLimit)}

                    <div className="field">
                        <label className="label">Total Cost</label>
                        <p className="has-text-weight-bold is-size-4">₱{!isNaN(totalCost) ? totalCost.toFixed(2) : '0.00'}</p>
                    </div>

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
                                I agree to the <a href="/terms_and_conditions">Terms and Conditions</a>, <a href="/cancel_policy">Cancellation Policy</a> and <a href="/website_data_policy">Data Policy</a>
                            </label>
                        </div>
                    </div>

                    {errorMessage && <p className="help is-danger">{errorMessage}</p>}
                    {successMessage && <p className="help is-success">{successMessage}</p>}
                </section>
                <footer className="modal-card-foot is-left">
                    <div className="buttons is-left">
                        <button className="button is-blue" onClick={handleSubmit}>Submit Reservation</button>
                        <button className="button" onClick={toggleModal}>Cancel</button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default AddEventReservation;
