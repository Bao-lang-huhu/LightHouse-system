import React, { useState } from 'react'; 
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CircularProgress, Select, MenuItem, CardMedia, Typography, Switch, FormControlLabel, FormControl, FormLabel, Button, TextField, Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import moment from 'moment';

const RoomBooking = () => {
    const location = useLocation();
    const [checked, setChecked] = useState(false);
    const [selectedBed, setSelectedBed] = useState('');
    const [gender, setGender] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [address, setAddress] = useState('');
    const [country, setCountry] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [errors, setErrors] = useState({});

    const { room, checkInDate, checkOutDate } = location.state || {};
    const actualRoom = room || {
        room_number: '101',
        room_type_name: 'Deluxe Room',
        room_description: 'A spacious deluxe room with a beautiful sea view.',
        room_pax_max: 3,
        room_rate: 150,
        room_final_rate: 120,
        room_disc_percentage: 20,
        images: { main: 'https://via.placeholder.com/128' },
    };

    const handleBedChange = (event) => setSelectedBed(event.target.value);
    const handleGenderChange = (event) => setGender(event.target.value);

    const handleCloseNotification = () => setNotification({ ...notification, open: false });

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
                await handleReservation(guest_id);
            } else {
                setNotification({ open: true, message: 'Failed to register guest.', severity: 'error' });
            }
        } catch (error) {
            setNotification({ open: true, message: 'Error registering guest.', severity: 'error' });
        }
    };

    const handleCancel = () => {
        // Remove local storage data if needed
        localStorage.removeItem('guestInfo');
        localStorage.removeItem('roomDetails');

        // Redirect back to /frontdesk_room_walk_in
        navigate('/frontdesk_room_walk_in');
    };

    const handleChange = () => {
        setChecked(!checked);
    };

    // Handle the notes input
    const handleNotesChange = (event) => {
        setNotes(event.target.value);
    };


    const handleCountryChange = (event) => {
        setCountry(event.target.value);
    };

    const handleFirstNameChange = (e) => {
        const value = e.target.value;
        // Allow only letters and spaces
        if (/^[A-Za-z\s]*$/.test(value)) {
            setFirstName(value);
        }
    };

    const handleLastNameChange = (e) => {
        const value = e.target.value;
        // Allow only letters and spaces
        if (/^[A-Za-z\s]*$/.test(value)) {
            setLastName(value);
        }
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);

        // Simple email validation using regex
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
            setErrors(prevErrors => ({
                ...prevErrors,
                email: "Please enter a valid email address"
            }));
        } else {
            setErrors(prevErrors => ({
                ...prevErrors,
                email: ""
            }));
        }
    };

    const handleReservation = async (guest_id) => {
        setLoading(true); 
        try {
            if (!room || !checkInDate || !checkOutDate || !guest_id) {
                setNotification({ open: true, message: 'Room, date, or guest details are missing.', severity: 'error' });
                return;
            }

            const reservationData = {
                guest_id,
                room_id: room.room_id,
                room_reservation_date: new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }),
                room_check_in_date: checkInDate,
                room_check_out_date: checkOutDate,
                reservation_status: 'CONFIRMED',
                room_notes: '',
                room_is_breakfast: checked,
                room_pax: room.room_pax_max,
                room_company: companyName,
                total_cost: room.room_final_rate * (moment(checkOutDate).diff(moment(checkInDate), 'days')),
            };

            const response = await axios.post('http://localhost:3001/api/registerRoomReservation', reservationData);

            if (response.status === 201) {
                setNotification({ open: true, message: 'Reservation confirmed!', severity: 'success' });
                localStorage.removeItem('guestInfo');
                localStorage.removeItem('roomDetails');

                 setTimeout(() => {
                    navigate('/frontdesk_room_walk_in');
                }, 3000);
            } else {
                setNotification({ open: true, message: 'Failed to confirm reservation.', severity: 'error' });
            }
        } catch (error) {
            setNotification({ open: true, message: 'Failed to register reservation.', severity: 'error' });
        } finally {
            setLoading(false); // Set loading to false after the process is complete
        }
    };

    const validateInputs = () => {
        const newErrors = {};
        if (!firstName) newErrors.firstName = "First name is required";
        if (!lastName) newErrors.lastName = "Last name is required";
        if (!gender) newErrors.gender = "Gender is required";
        if (!birthdate) newErrors.birthdate = "Birthdate is required";
        if (!address) newErrors.address = "Address is required";
        if (!country) newErrors.country = "Country is required";
        if (!email) {
            newErrors.email = "Email is required";
        } else {
            // Simple email validation check
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                newErrors.email = "Please enter a valid email address";
            }
        }
        if (!phoneNumber) newErrors.phoneNumber = "Phone number is required";

        setErrors(newErrors);

        // Return true if there are no errors
        return Object.keys(newErrors).length === 0;
    };

    return (
        <section className='section-p1'>
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

            <div className="container-white">
                <h1 className='subtitle'><strong>Room Booking</strong></h1>
                <h1 className='label'><strong>Guest Details</strong></h1>

                <div className="columns is-multiline">
                    {/* Guest Details Input */}
                    <div className="column is-one-half">
                       <TextField 
                            fullWidth 
                            label="First Name" 
                            placeholder="Enter your first name" 
                            value={firstName} 
                            onChange={handleFirstNameChange} 
                            margin="normal"
                            error={!!errors.firstName}
                            helperText={errors.firstName}
                        />
                        <TextField 
                            fullWidth 
                            label="Last Name" 
                            placeholder="Enter your last name" 
                            value={lastName} 
                            onChange={handleLastNameChange} 
                            margin="normal"
                            error={!!errors.lastName}
                            helperText={errors.lastName}
                        />
                        <FormControl fullWidth margin="normal" error={!!errors.gender}>
                            <FormLabel>Gender</FormLabel>
                            <Select value={gender} onChange={handleGenderChange} displayEmpty>
                                <MenuItem value=""><em>Select Gender</em></MenuItem>
                                <MenuItem value="MALE">Male</MenuItem>
                                <MenuItem value="FEMALE">Female</MenuItem>
                                <MenuItem value="NON-BINARY">Non-Binary</MenuItem>
                                <MenuItem value="PREFER NOT TO SAY">Prefer Not To Say</MenuItem>
                            </Select>
                            {errors.gender && <p style={{ color: 'red', marginTop: '5px' }}>{errors.gender}</p>}
                        </FormControl>
                        <TextField 
                            fullWidth 
                            type="date" 
                            label="Birthdate" 
                            InputLabelProps={{ shrink: true }} 
                            value={birthdate} 
                            onChange={(e) => setBirthdate(e.target.value)} 
                            margin="normal"
                            error={!!errors.birthdate}
                            helperText={errors.birthdate}
                        />
                        <TextField 
                            fullWidth 
                            label="Address" 
                            value={address} 
                            onChange={(e) => setAddress(e.target.value)} 
                            margin="normal"
                            error={!!errors.address}
                            helperText={errors.address}
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
                            onChange={handleEmailChange} 
                            margin="normal"
                            error={!!errors.email}
                            helperText={errors.email}
                        />
                        <TextField 
                            fullWidth 
                            label="Phone Number" 
                            value={phoneNumber} 
                            onChange={(e) => setPhoneNumber(e.target.value)} 
                            margin="normal"
                            error={!!errors.phoneNumber}
                            helperText={errors.phoneNumber}
                        />
                        <TextField 
                            fullWidth 
                            label="Company Name" 
                            value={companyName} 
                            onChange={(e) => setCompanyName(e.target.value)} 
                            margin="normal"
                        />
                    </div>

                    {/* Room Information */}
                    <div className="column is-one-half">
                        <Card>
                            <CardMedia
                                component="img"
                                style={{ height: '50%', width: '50%', objectFit: 'cover' }}
                                image={actualRoom.images.main}
                                alt={`Room ${actualRoom.room_number}`}
                            />
                            <CardContent>
                                <Typography variant="h5" component="div"><strong>Room {actualRoom.room_number}</strong> </Typography>
                                <Typography variant="subtitle1" color="textSecondary">{actualRoom.room_type_name}</Typography>
                                <Typography variant="body2" color="textSecondary"><strong>Description: </strong>{actualRoom.room_description}</Typography>
                                <Typography variant="body2" color="textSecondary">Max People: {actualRoom.room_pax_max}</Typography>
                                <Typography variant="body2" color="textSecondary">Rate: ₱{actualRoom.room_rate}/night</Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Final Rate: ₱{actualRoom.room_final_rate}/night{' '}
                                    <span style={{ color: 'red' }}>{actualRoom.room_disc_percentage}% off</span>
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Check-In Date: {checkInDate ? moment(checkInDate).format('MMMM D, YYYY') : 'N/A'}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Check-Out Date: {checkOutDate ? moment(checkOutDate).format('MMMM D, YYYY') : 'N/A'}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Number of Nights:  
                                     {checkInDate && checkOutDate 
                                        ? moment(checkOutDate).diff(moment(checkInDate), 'days') 
                                        : 'None'} nights
                                </Typography>

                                <Typography variant="body1" color="textSecondary">
                                    Total Cost: <span className='is-size-3'>  ₱ { room.room_final_rate * (moment(checkOutDate).diff(moment(checkInDate), 'days'))}</span>
                                </Typography>
                            </CardContent>
                        </Card>

                          {/* Toggle for Breakfast */}
                          <div style={{ marginTop: '20px' }}>
                            <FormControlLabel
                                control={<Switch checked={checked} onChange={handleChange} />}
                                label="With Breakfast"
                            />
                        </div>

                        {/* Text Area for Notes */}
                        <TextField
                            fullWidth
                            label="Additional Notes"
                            placeholder="Enter any additional notes..."
                            multiline
                            rows={4}
                            value={notes}
                            onChange={handleNotesChange}
                            margin="normal"
                        />
                 
                    </div>
                </div>

                {/* Save and Cancel Buttons */}
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
        </section>
    );
};

export default RoomBooking;
