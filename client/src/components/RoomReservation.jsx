import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import 'bulma/css/bulma.min.css';
import './pages.css';
import '../App.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../layouts/Breadcrumbs';

const RoomReservation = () => {
    const breadcrumbItems = [
        { label: 'Home', link: '/' },
        { label: 'Room Search' },
        { label: 'Room Reservation' },
    ];

    const [guestInfo, setGuestInfo] = useState(null);
    const [additionalNotes, setAdditionalNotes] = useState('');
    const [roomIsBreakfast, setRoomIsBreakfast] = useState(false);
    const [roomCompany, setRoomCompany] = useState('');
    const [roomPax, setRoomPax] = useState(1);
    const [termsAccepted, setTermsAccepted] = useState(false); // New state for terms acceptance
    const location = useLocation();
    const navigate = useNavigate();

    const { room, checkInDate, checkOutDate } = location.state || {};
    const [totalNights, setTotalNights] = useState(0);
    const [totalCost, setTotalCost] = useState(0);

    useEffect(() => {
        const fetchGuestDetails = async () => {
            const token = localStorage.getItem('token'); // Assuming token contains guest data
            const savedRoomPax = localStorage.getItem('totalGuests'); // Retrieve roomPax from localStorage

            if (!token) {
                console.error("No token found.");
                return;
            }

            // Set roomPax from localStorage
            if (savedRoomPax) {
                setRoomPax(parseInt(savedRoomPax, 10)); // Convert to integer and store in state
            }

            try {
                const response = await axios.get('https://light-house-system.vercel.app/api/getGuestDetails', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setGuestInfo(response.data); // Set guestInfo with the fetched data
            } catch (error) {
                console.error('Error fetching guest details:', error);
            }
        };

        fetchGuestDetails();
    }, []);

    // Calculate total nights and cost
    useEffect(() => {
        if (checkInDate && checkOutDate && room) {
            const checkIn = new Date(checkInDate);
            const checkOut = new Date(checkOutDate);
            const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)); // Calculate number of nights
            setTotalNights(nights);
            setTotalCost(nights * room.room_final_rate); // Calculate total cost
        }
    }, [checkInDate, checkOutDate, room]);

    const handleReservation = async () => {
        if (!termsAccepted) {
            alert("Please accept the terms and conditions before proceeding.");
            return;
        }

        try {
            if (!room || !checkInDate || !checkOutDate || !guestInfo?.guest_id) {
                alert("Room, date, or guest details are missing. Please try again.");
                return;
            }

            // Prepare reservation data including roomPax and room_company
            const reservationData = {
                guest_id: guestInfo.guest_id,
                room_id: room.room_id,
                room_reservation_date: new Date().toISOString(),
                room_check_in_date: checkInDate,
                room_check_out_date: checkOutDate,
                reservation_status: 'CONFIRMED',
                room_notes: additionalNotes,
                room_is_breakfast: roomIsBreakfast,
                room_pax: roomPax,
                room_company: roomCompany || guestInfo.company || null, // Optional company field
                cancel_reservation_request: null,
                total_cost: totalCost,
            };

            console.log('Reservation Data:', reservationData);

            // Send POST request to backend API
            const response = await axios.post('https://light-house-system.vercel.app/api/registerRoomReservation', reservationData);

            if (response.status === 201) {
                alert('Reservation confirmed!');
                navigate('/');
            } else {
                alert('Failed to confirm reservation.');
            }
        } catch (error) {
            console.error('Error registering reservation:', error);
            alert('Failed to register reservation.');
        }
    };

    if (!guestInfo) {
        return <div>Loading guest details...</div>;
    }

    return (
        <section className='section-m1'>
            <div className="contact-hero-image">
                <div className="text-content-title">
                    <h1 className='title'>Room Booking Review</h1>
                </div>
            </div>

            <div>
                <Breadcrumbs items={breadcrumbItems} />
            </div>

            <div className='box section-p1 m-2'>
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
                            <label className="label">Number of Nights:</label>
                            <p>{totalNights}</p>
                        </div>
                        <div className="field">
                            <label className="label">Rate per Night:</label>
                            <p>₱{room ? room.room_final_rate : 'N/A'}</p>
                        </div>
                        <div className="field">
                            <label className="label">Total Cost (Rate x Nights):</label>
                            <p>₱{totalCost}</p>
                        </div>
                    </div>

                    {/* Booking Summary Section */}
                    <div className="column is-one-third">
                        <div className="field">
                            <label className="subtitle">Booking Summary</label>
                        </div>
                        <div className="field">
                            <label className="label">Check-In Date:</label>
                            <p>{checkInDate || 'N/A'}</p>
                        </div>
                        <div className="field">
                            <label className="label">Check-Out Date:</label>
                            <p>{checkOutDate || 'N/A'}</p>
                        </div>
                        <div className="field">
                            <label className="label">Room Type:</label>
                            <p>{room ? room.room_type_name : 'N/A'}</p>
                        </div>
                        <div className="field">
                            <label className="label">Room Number:</label>
                            <p>{room ? room.room_number : 'N/A'}</p>
                        </div>
                        <div className="field">
                            <label className="label">Room Pax:</label>
                            <p>{roomPax}</p> {/* Display the roomPax value */}
                        </div>

                        {/* Room Company */}
                        <div className="field">
                            <label className="label">Company Name (if applicable):</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="text"
                                    placeholder="Company Name"
                                    value={roomCompany}
                                    onChange={(e) => setRoomCompany(e.target.value)} // Add company field input
                                />
                            </div>
                        </div>

                        {/* Additional Preferences */}
                        <div className="field">
                            <label className="label">Breakfast Option:</label>
                            <div className="control">
                                <label className="checkbox">
                                    <input
                                        type="checkbox"
                                        checked={roomIsBreakfast}
                                        onChange={() => setRoomIsBreakfast(!roomIsBreakfast)}
                                    />
                                    Include Breakfast
                                </label>
                            </div>
                        </div>

                        {/* Additional Notes */}
                        <div className="field">
                            <label className="label">Additional Notes:</label>
                            <textarea
                                className="textarea"
                                value={additionalNotes}
                                onChange={(e) => setAdditionalNotes(e.target.value)}
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Terms and Conditions */}
                <div className="field mt-5">
                    <label className="label">
                            Please review and agree to our Terms and Conditions, Data Policy, and Cancellation Policy before proceeding with your reservation.
                        </label>
                    <label className="checkbox">
                        <input 
                            type="checkbox" 
                            checked={termsAccepted} // Controlled component
                            onChange={() => setTermsAccepted(!termsAccepted)} // Toggle state
                        /> I agree to the <Link to="/terms_and_conditions">Terms and Conditions</Link>, <Link to="/cancel_policy">Cancellation Policy</Link> and <Link to="/website_data_policy">Data Policy</Link>
                    </label>
                </div>


                <div className="field is-flex is-justify-content-flex-end">
                    <button 
                        className="button is-blue" 
                        onClick={handleReservation}
                        disabled={!termsAccepted} // Disable button if terms are not accepted
                    >
                        Book Now!
                    </button>
                </div>
            </div>
        </section>
    );
};

export default RoomReservation;
