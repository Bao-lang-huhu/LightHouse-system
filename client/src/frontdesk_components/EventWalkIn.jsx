import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import './components_f.css';
import '../App.css';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ClipLoader from 'react-spinners/ClipLoader';
import { CircularProgress, Snackbar, Alert, FormControl, FormLabel, RadioGroup, Switch,FormControlLabel, Radio, Button, TextField, Select, MenuItem, Typography, Checkbox } from '@mui/material';
import moment from 'moment';
import { IoHelpCircle, IoWarning } from 'react-icons/io5';


function EventWalkIn() {
    const [selectedDate, setSelectedDate] = useState(null);
    const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isButtonLoading, setIsButtonLoading] = useState(false);

    // Guest details state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [address, setAddress] = useState('');
    const [country, setCountry] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [gender, setGender] = useState('');
    const [checked, setChecked] = useState(false);

    const [errors, setErrors] = useState({});

    const [venues, setVenues] = useState([]);
    const [foodPackages, setFoodPackages] = useState([]);
    const [foodItems, setFoodItems] = useState([]);
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
        severity: 'success',
    });
    const [totalCost, setTotalCost] = useState(0);
    const [guestError, setGuestError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchActiveVenuesAndPackages();
        fetchFoodItems();
    
        const storedDate = localStorage.getItem('event_date');
        if (storedDate) {
            setEventDetails(prevDetails => ({
                ...prevDetails,
                event_date: storedDate
            }));
        }
    }, []); // Add empty dependency array to run only once
    

    const fetchActiveVenuesAndPackages = async () => {
        try {
            const venuesResponse = await axios.get('http://localhost:3001/api/getActiveVenues');
            const foodPackagesResponse = await axios.get('http://localhost:3001/api/getActiveFoodPackages');
            setVenues(venuesResponse.data);
            setFoodPackages(foodPackagesResponse.data);
        } catch (error) {
            setNotification({
                open: true,
                message: 'Error fetching venues and food packages.',
                severity: 'error'
            });
        }
    };

    const fetchFoodItems = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/getFoodItems');
            const filteredItems = response.data.filter(item => item.food_service_category === 'BOTH' || item.food_service_category === 'EVENT');
            setFoodItems(filteredItems);
        } catch (error) {
            setNotification({
                open: true,
                message: 'Error fetching food items.',
                severity: 'error'
            });
        }
    };

    const handleVenueChange = (e) => {
        const selectedVenue = venues.find(venue => venue.event_venue_id === e.target.value);
        setSelectedVenueId(e.target.value);
        setMaxGuests(selectedVenue ? selectedVenue.venue_max_pax : 0);
        
        if (selectedVenue) {
            const venuePrice = selectedVenue.venue_final_price || 0;
            const selectedFoodPrice = selectedFoodPackageId
                ? foodPackages.find(pkg => pkg.event_fd_pckg_id === selectedFoodPackageId).event_fd_pckg_final_price || 0
                : 0;
            
            calculateTotalCost(venuePrice, selectedFoodPrice); // Use correct prices
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

            const foodPrice = selectedPackage.event_fd_pckg_final_price || 0;
            const selectedVenuePrice = selectedVenueId
                ? venues.find(venue => venue.event_venue_id === selectedVenueId).venue_final_price || 0
                : 0;
            
            calculateTotalCost(selectedVenuePrice, foodPrice); // Use correct prices
        }
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
        
        const total = venueCost + foodCost; // Add only the venue and food package prices
        
        setTotalCost(total); // Update the total cost state
        setEventDetails(prevDetails => ({
            ...prevDetails,
            event_total_price: total
        }));
    };
    
    

    const renderFoodDropdown = (category, limit) => {
        const categoryItems = foodItems.filter(item => item.food_category_name === category.toUpperCase());
        return [...Array(limit)].map((_, index) => {
            const field = `${category.toUpperCase()}${index + 1}`;
            return (
                <FormControl key={index} fullWidth margin="normal">
                    <Select
                        value={selectedFoodItems[field] || ''}
                        onChange={(e) => setSelectedFoodItems({ ...selectedFoodItems, [field]: e.target.value })}
                        displayEmpty
                    >
                        <MenuItem value="">
                            <em>Select {category} {index + 1}</em>
                        </MenuItem>
                        {categoryItems.map(food => (
                            <MenuItem key={food.food_id} value={food.food_id}>
                                {food.food_name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
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
        setNotification({ open: false, message: '', severity: '' });
        setTotalCost(0);
    };
    
    
    const handleCancel = () => {
        resetForm();  // Reset inputs
    };



    const today = new Date();
    const twoMonthsFromToday = moment().add(2, 'months').toDate();

    const checkDateConflict = async () => {
        if (!selectedDate) {
            alert("Please select a date before proceeding.");
            return;
        }

        setIsButtonLoading(true); // Set button to loading state

        try {
            const eventDate = moment(selectedDate).format('YYYY-MM-DD'); // Format date as YYYY-MM-DD

            // Make the GET request to check for date conflicts
            const response = await axios.get('http://localhost:3001/api/getEventReservations', {
                params: { event_date: eventDate },
            });

            setIsButtonLoading(false); // Reset button loading state

            if (response.data.conflict) {
                setIsConflictModalOpen(true); // Open conflict modal
                setIsFormVisible(false); // Hide form on conflict
            } else {
                setIsFormVisible(true); // Show form if no conflict
                setIsConflictModalOpen(false); // Close conflict modal
            }
        } catch (err) {
            console.error('Failed to check date conflict:', err);
            setIsButtonLoading(false); // Reset button loading state on error
        }
    };

    const toggleConflictModal = () => {
        setIsConflictModalOpen(!isConflictModalOpen);
    };

    const handleGenderChange = (event) => setGender(event.target.value);
    const handleCountryChange = (event) => setCountry(event.target.value);
    const registerGuestRoom = async () => {
        try {
            const guestData = {
                guest_fname: firstName,
                guest_lname: lastName,
                guest_birthdate: birthdate,
                guest_address: address,
                guest_email: email,
                guest_country: country,
                guest_phone_no: phoneNumber,
                guest_gender: gender,
            };
    
            const guestResponse = await axios.post('http://localhost:3001/api/registerGuestRoom', guestData);
            if (guestResponse.status === 201) {
                const guest_id = guestResponse.data.guest_id;
                await handleSubmit(guest_id); // Pass the guest_id to handleSubmit
            } else {
                setNotification({ open: true, message: 'Failed to register guest.', severity: 'error' });
            }
        } catch (error) {
            setNotification({ open: true, message: 'Error registering guest.', severity: 'error' });
        }
    };
    
    const handleSubmit = async (guest_id) => { // Accept guest_id as a parameter
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
    
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:3001/api/registerEventReservation', {
                ...eventDetails,
                event_venue_id: selectedVenueId,
                event_fd_pckg_id: selectedFoodPackageId,
                selectedFoodItems,
                guest_id // Include the guest_id in the event reservation data
            });
    
            if (response.status === 201) {
                setNotification({
                    open: true,
                    message: 'Event reservation created successfully!',
                    severity: 'success'
                });
                
                localStorage.removeItem('guestInfo');
                setLoading(false); // Set loading to false
                
                // Show the Snackbar for 3 seconds, then reset the form and close
                setTimeout(() => {
                    resetForm(); // Reset the form fields
                    setIsFormVisible(false); // Close the form after the timeout
                    
                    // Refresh the page to ensure updated data is loaded
                    window.location.reload();
                }, 3000);
            }
            

        } catch (error) {
            setNotification({
                open: true,
                message: 'Error creating event reservation. Please try again.',
                severity: 'error'
            });
            setLoading(false);
        }
    };
    

    return (
        <section className='section-p1'>
            <header>
                <div style={{ backgroundColor: 'white', borderRadius: '10px 10px' }}>
                    <div className='column'>
                        <h1 className='subtitle'>
                            <strong>Event Walk-In Reservation</strong>
                        </h1>
                    </div>
                    <div className="checkdate">
                        <div className="input-container">
                            <p><strong>Check Available Event Date</strong></p>
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => {
                                    setSelectedDate(date);
                                    // Update eventDetails with the selected date
                                    setEventDetails((prevDetails) => ({
                                        ...prevDetails,
                                        event_date: moment(date).format('MMMM D, YYYY') // Format the date as desired
                                    }));
                                }}
                                minDate={today}
                                maxDate={twoMonthsFromToday}
                                dateFormat="MMM d, yyyy"
                                placeholderText="Select event date"
                                filterDate={(date) => date >= today} // Prevent selection of past dates
                                showDisabledMonthNavigation
                            />
                            {selectedDate && <p>{moment(selectedDate).format('MMMM D, YYYY')}</p>}
                        </div>
                    </div>

                    <div className="buttons is-centered">
                        <button
                            className={`button is-blue search ${isButtonLoading ? 'is-loading' : ''}`}
                            onClick={checkDateConflict}
                            disabled={!selectedDate || isButtonLoading} // Disable button if no date selected or loading
                        >
                            {isButtonLoading ? 'Checking...' : 'SEARCH'}
                        </button>
                    </div>
                    {/* Clip Loader */}
                    {isButtonLoading && (
                        <div className="has-text-centered">
                            <ClipLoader color={'#0077B7'} loading={isButtonLoading} size={35} />
                        </div>
                    )}
                </div>
                <hr />
            </header>

            {/* Conflict Modal */}
            {isConflictModalOpen && (
                <div className="modal is-active">
                    <div className="modal-background" onClick={toggleConflictModal}></div>
                    <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
                        <div className="box">
                            <IoWarning size={64} style={{ color: '#0077B7', marginBottom: '1rem' }} />
                            <h1 className="title is-size-5">Date Conflict</h1>
                            <p>The selected date has already been reserved for another event. Please choose a different date.</p>
                            <button className="button is-blue mt-4" onClick={toggleConflictModal}>Try Again</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Show Guest Details Form if No Conflict */}
            {isFormVisible && (
                <div className="container-white">
                     <Snackbar
                        open={notification.open}
                        autoHideDuration={3000}
                        onClose={handleCloseNotification}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} 
                        sx={{ width: '500px' }}>
                        <Alert onClose={handleCloseNotification} severity={notification.severity}  style={{ fontSize: '1.2rem', padding: '20px' }} >
                            {notification.message}
                            
                        </Alert>
                    </Snackbar>
                    <h1 className='subtitle'><strong>Event Booking</strong></h1>
                    <div className="columns is-multiline">
                        {/* Guest Details Input */}
                        <div className="column is-one-half">
                            <TextField
                                fullWidth
                                label="First Name"
                                placeholder="Enter your first name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                margin="normal"
                            />
                            <TextField
                                fullWidth
                                label="Last Name"
                                placeholder="Enter your last name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                margin="normal"
                            />
                            <FormControl fullWidth margin="normal">
                                <FormLabel>Gender</FormLabel>
                                <Select value={gender} onChange={handleGenderChange} displayEmpty>
                                    <MenuItem value=""><em>Select Gender</em></MenuItem>
                                    <MenuItem value="MALE">Male</MenuItem>
                                    <MenuItem value="FEMALE">Female</MenuItem>
                                    <MenuItem value="NON-BINARY">Non-Binary</MenuItem>
                                    <MenuItem value="PREFER NOT TO SAY">Prefer Not To Say</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                fullWidth
                                type="date"
                                label="Birthdate"
                                InputLabelProps={{ shrink: true }}
                                value={birthdate}
                                onChange={(e) => setBirthdate(e.target.value)}
                                margin="normal"
                            />
                            <TextField
                                fullWidth
                                label="Address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                margin="normal"
                            />
                            <FormControl fullWidth margin="normal" error={!!errors.country}>
                            <FormLabel>Country</FormLabel>
                            <Select
                                value={country}
                                onChange={handleCountryChange}
                                displayEmpty
                                inputProps={{ 'aria-label': 'Select Country' }}
                            >
                                <MenuItem value="">
                                    <em>Select Country</em>
                                </MenuItem>
                                <MenuItem value="Argentina">Argentina</MenuItem>
                                <MenuItem value="Australia">Australia</MenuItem>
                                <MenuItem value="Belgium">Belgium</MenuItem>
                                <MenuItem value="Brazil">Brazil</MenuItem>
                                <MenuItem value="Canada">Canada</MenuItem>
                                <MenuItem value="China">China</MenuItem>
                                <MenuItem value="Denmark">Denmark</MenuItem>
                                <MenuItem value="Egypt">Egypt</MenuItem>
                                <MenuItem value="Finland">Finland</MenuItem>
                                <MenuItem value="France">France</MenuItem>
                                <MenuItem value="Germany">Germany</MenuItem>
                                <MenuItem value="India">India</MenuItem>
                                <MenuItem value="Indonesia">Indonesia</MenuItem>
                                <MenuItem value="Italy">Italy</MenuItem>
                                <MenuItem value="Japan">Japan</MenuItem>
                                <MenuItem value="Malaysia">Malaysia</MenuItem>
                                <MenuItem value="Mexico">Mexico</MenuItem>
                                <MenuItem value="Netherlands">Netherlands</MenuItem>
                                <MenuItem value="New Zealand">New Zealand</MenuItem>
                                <MenuItem value="Norway">Norway</MenuItem>
                                <MenuItem value="Philippines">Philippines</MenuItem>
                                <MenuItem value="Russia">Russia</MenuItem>
                                <MenuItem value="Singapore">Singapore</MenuItem>
                                <MenuItem value="South Africa">South Africa</MenuItem>
                                <MenuItem value="South Korea">South Korea</MenuItem>
                                <MenuItem value="Spain">Spain</MenuItem>
                                <MenuItem value="Sweden">Sweden</MenuItem>
                                <MenuItem value="Switzerland">Switzerland</MenuItem>
                                <MenuItem value="United Kingdom">United Kingdom</MenuItem>
                                <MenuItem value="United States">United States</MenuItem>
                            </Select>
                            {errors.country && <p style={{ color: 'red', marginTop: '5px' }}>{errors.country}</p>}
                        </FormControl>  
                            <TextField
                                fullWidth
                                type="email"
                                label="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                margin="normal"
                            />
                            <TextField
                                fullWidth
                                label="Phone Number"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                margin="normal"
                            />
                            <TextField
                                fullWidth
                                label="Company Name"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                margin="normal"
                            />
                        </div>
                        {/* Event Information */}
                        <div className="column is-one-half">
                            <div className="event-form">
                            <FormControl fullWidth margin="normal">
                                <TextField
                                    label="Event Name"
                                    value={eventDetails.event_name}
                                    onChange={handleInputChange}
                                    name="event_name"
                                />
                            </FormControl>

                            <FormControl fullWidth margin="normal">
                                <Select
                                    value={eventDetails.event_type}
                                    onChange={handleInputChange}
                                    name="event_type"
                                    displayEmpty
                                >
                                    <MenuItem value=""><em>Select Event Type</em></MenuItem>
                                    <MenuItem value="WEDDING">WEDDING</MenuItem>
                                    <MenuItem value="BIRTHDAY">BIRTHDAY</MenuItem>
                                    <MenuItem value="GALA">GALA</MenuItem>
                                    <MenuItem value="SEMINAR">SEMINAR</MenuItem>
                                    <MenuItem value="EXHIBITION">EXHIBITION</MenuItem>
                                    <MenuItem value="FIESTA">FIESTA</MenuItem>
                                    <MenuItem value="ANNIVERSARY">ANNIVERSARY</MenuItem>
                                    <MenuItem value="VALENTINES">VALENTINES</MenuItem>
                                    <MenuItem value="CHRISTMAS">CHRISTMAS</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl fullWidth margin="normal">
                                <Typography>Event Date: {eventDetails.event_date ? eventDetails.event_date : 'No date selected'}</Typography>
                            </FormControl>


                            <div className="time-fields">
                            <FormLabel component="legend" className='mb-2'>Event Time</FormLabel>

                                <TextField
                                    type="time"
                                    label="Start Time"
                                    name="event_start_time"
                                    onChange={handleInputChange}
                                    value={eventDetails.event_start_time}
                                />
                                <TextField
                                    type="time"
                                    label="End Time"
                                    name="event_end_time"
                                    readOnly
                                    value={eventDetails.event_end_time}
                                />
                            </div>

                            <FormControl component="fieldset">
                            <FormLabel component="legend">Venue</FormLabel>

                                <RadioGroup
                                    value={selectedVenueId}
                                    onChange={(e) => {
                                        handleVenueChange(e);
                                        // Reset the number of guests to 20 when a new venue is selected
                                        handleInputChange({ target: { name: "event_no_guest", value: 20 } });
                                    }}
                                >
                                    {venues.map(venue => (
                                        <FormControlLabel
                                            key={venue.event_venue_id}
                                            value={venue.event_venue_id}
                                            control={<Radio />}
                                            label={`${venue.venue_name} (Max Guests: ${venue.venue_max_pax} - Price: ${venue.venue_final_price})`}
                                        />
                                    ))}
                                </RadioGroup>
                            </FormControl>

                            <FormControl fullWidth margin="normal">
                            <FormLabel component="legend">Number of Guest</FormLabel>

                                <div className="control is-flex is-align-items-center">
                                    {/* Decrease Button */}
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => {
                                            const currentGuests = parseInt(eventDetails.event_no_guest, 10) || 20;
                                            if (currentGuests > 20) {
                                                handleInputChange({ target: { name: "event_no_guest", value: currentGuests - 1 } });
                                            }
                                        }}
                                        disabled={!selectedVenueId || eventDetails.event_no_guest <= 20} // Disable if no venue is selected or below min
                                    >
                                        -
                                    </Button>

                                    {/* Display Current Number of Guests */}
                                    <TextField
                                        value={eventDetails.event_no_guest || ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (/^\d*$/.test(value) && parseInt(value, 10) >= 20 && parseInt(value, 10) <= maxGuests) {
                                                handleInputChange(e);
                                            }
                                        }}
                                        onBlur={(e) => {
                                            const value = parseInt(e.target.value, 10);
                                            if (value < 20 || value > maxGuests || isNaN(value)) {
                                                handleInputChange({ target: { name: "event_no_guest", value: 20 } });
                                            }
                                        }}
                                        placeholder={`Max Guests: ${maxGuests}`}
                                        inputProps={{ readOnly: true, min: 20, step: 1 }}
                                        style={{ textAlign: 'center', width: '80px', margin: '0 10px' }}
                                        disabled={!selectedVenueId} // Disable if no venue is selected
                                    />

                                    {/* Increase Button */}
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => {
                                            const currentGuests = parseInt(eventDetails.event_no_guest, 10) || 20;
                                            if (currentGuests < maxGuests) {
                                                handleInputChange({ target: { name: "event_no_guest", value: currentGuests + 1 } });
                                            }
                                        }}
                                        disabled={!selectedVenueId || eventDetails.event_no_guest >= maxGuests} // Disable if no venue is selected or above max
                                    >
                                        +
                                    </Button>
                                </div>
                            </FormControl>




                            <FormControl component="fieldset" fullWidth margin="normal">
                                <FormLabel component="legend">Food Package</FormLabel>
                                <RadioGroup
                                    value={selectedFoodPackageId}
                                    onChange={handleFoodPackageChange}
                                    name="foodPackage"
                                >
                                    {foodPackages.map((pkg) => (
                                        <FormControlLabel
                                            key={pkg.event_fd_pckg_id}
                                            value={pkg.event_fd_pckg_id}
                                            control={<Radio />}
                                            label={`${pkg.event_fd_pckg_name} (Price: ₱${pkg.event_fd_pckg_final_price})`}
                                        />
                                    ))}
                                </RadioGroup>
                            </FormControl>

                            {foodPackageLimits.mainDishLimit && renderFoodDropdown('MAIN', foodPackageLimits.mainDishLimit)}
                            {foodPackageLimits.pastaLimit && renderFoodDropdown('PASTA', foodPackageLimits.pastaLimit)}
                            {foodPackageLimits.dessertLimit && renderFoodDropdown('DESSERT', foodPackageLimits.dessertLimit)}
                            {foodPackageLimits.drinksLimit && renderFoodDropdown('DRINK', foodPackageLimits.drinksLimit)}
                            <Typography variant="h6">Total Cost: ₱{totalCost.toFixed(2)}</Typography>
                            </div>

                        </div>
                    </div>
                    <footer className="modal-card-foot is-flex is-justify-content-flex-end is-align-items-center">
                    <Button
                        variant="contained"
                        color="primary"
                        style={{ marginRight: '10px' }}
                        onClick={registerGuestRoom}
                        disabled={loading} // Disable button when loading
                    >
                        {loading ? <CircularProgress size={24} /> : 'Save'}
                    </Button>
                    <Button
                        variant="contained"
                        color="inverted"
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                </footer>
                </div>
            )}
            
        </section>
    );
}

export default EventWalkIn;
