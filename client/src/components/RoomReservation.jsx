import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import 'bulma/css/bulma.min.css';
import './pages.css';
import '../App.css';
import Breadcrumbs from '../layouts/Breadcrumbs';
import { IoPencil, IoPerson, IoReceipt } from 'react-icons/io5';
import { Snackbar, Alert } from '@mui/material'; 
import SuccessModal from '../messages/successModal';
import ErrorModal from '../messages/errorModal';

const RoomReservation = () => {
    const breadcrumbItems = [
        { label: 'Home', link: '/' },
        { label: 'Room Search', action: () => navigate(-1)  },
        { label: 'Room Reservation' },
    ];

    const [guestInfo, setGuestInfo] = useState(null);
    const [additionalNotes, setAdditionalNotes] = useState('');
    const [roomIsBreakfast, setRoomIsBreakfast] = useState(false);
    const [roomCompany, setRoomCompany] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false); 
    const location = useLocation();
    const navigate = useNavigate();

    const { rooms, checkInDate, checkOutDate, totalPeople } = location.state || {};
    const [totalNights, setTotalNights] = useState(0);
    const [totalCost, setTotalCost] = useState(0);

    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success', 
    });

    const [showSuccessModal, setShowSuccessModal] = useState(false); 
    const [showErrorModal, setShowErrorModal] = useState(false);

    useEffect(() => {
        const fetchGuestDetails = async () => {
            const token = localStorage.getItem('token'); 

            if (!token) {
                setNotification({ open: true, message: "No token found.", severity: "error" });
                return;
            }

            try {
                const response = await axios.get('https://light-house-system-h74t-server.vercel.app/api/getGuestDetails', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setGuestInfo(response.data); 
            } catch (error) {
                setNotification({ open: true, message: 'Error fetching guest details.', severity: 'error' });
            }
        };

        fetchGuestDetails();
    }, []);

    useEffect(() => {
        if (checkInDate && checkOutDate && rooms?.length) {
            const checkIn = new Date(checkInDate);
            const checkOut = new Date(checkOutDate);
            const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)); 
            setTotalNights(nights);

            const cost = rooms.reduce((acc, room) => acc + (nights * room.room_final_rate), 0);
            setTotalCost(cost);
        }
    }, [checkInDate, checkOutDate, rooms]);

    const handleReservation = async () => {
        if (!termsAccepted) {
            setNotification({ open: true, message: "Please accept the terms and conditions before proceeding.", severity: "warning" });
            return;
        }

        try {
            if (!rooms?.length || !checkInDate || !checkOutDate || !guestInfo?.guest_id) {
                setNotification({ open: true, message: "Room, date, or guest details are missing.", severity: "error" });
                return;
            }

            const guestsPerRoom = Math.floor(totalPeople / rooms.length);
            const remainingGuests = totalPeople % rooms.length;

            const reservationPromises = rooms.map((room, index) => {
                const roomPax = guestsPerRoom + (index < remainingGuests ? 1 : 0);
                const reservationData = {
                    guest_id: guestInfo.guest_id,
                    room_id: room.room_id,
                    room_reservation_date: new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }),
                    room_check_in_date: checkInDate,
                    room_check_out_date: checkOutDate,
                    reservation_status: 'CONFIRMED',
                    room_notes: additionalNotes,
                    room_is_breakfast: roomIsBreakfast,
                    room_pax: roomPax, // Number of guests assigned to this room
                    room_company: roomCompany || guestInfo.company || null, 
                    cancel_reservation_request: null,
                    total_cost: totalNights * room.room_final_rate,
                };

                return axios.post('https://light-house-system-h74t-server.vercel.app/api/registerRoomReservation', reservationData);
            });

            const responses = await Promise.all(reservationPromises);

            if (responses.every(response => response.status === 201)) {
                setNotification({ open: true, message: 'Reservations confirmed!', severity: 'success' });
                setShowSuccessModal(true);
            } else {
                throw new Error('Failed to confirm one or more reservations.');
            }
        } catch (error) {
            setNotification({ open: true, message: 'Failed to register reservations.', severity: 'error' });
            setShowErrorModal(true); 
        }
    };

    if (!guestInfo) {
        return <div>Loading guest details...</div>;
    }

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    return (
        <section className='section-m1'>
            <Snackbar
                open={notification.open}
                autoHideDuration={3000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                sx={{ width: '400px' }}
            >
                <Alert onClose={handleCloseNotification} severity={notification.severity} style={{ fontSize: '1.2rem', padding: '20px' }}>
                    {notification.message}
                </Alert>
            </Snackbar>

            <div className="contact-hero-image">
                <div className="text-content-title">
                    <h1 className='title'>Room Booking Review</h1>
                </div>
            </div>

            <div>
                <Breadcrumbs items={breadcrumbItems} />
            </div>

            <div className='box section' style={{ margin: '1rem auto', maxWidth: '1200px' }}>
                <div className="columns is-variable is-8 is-multiline">
                     {/* Guest Information Section */}
                     <div className="column is-one-third">
                        <div className="field">
                            <label className="subtitle"><IoPerson className='mr-2'/>Guest Information</label>
                        </div>
                        <div className="field">
                            <label className="label" style={{ color: '#7f8c8d' }}>Name: <strong>{guestInfo.guest_fname || 'N/A'} {guestInfo.guest_lname || 'N/A'}</strong></label>
                        </div>
                        <div className="field">
                            <label className="label" style={{ color: '#7f8c8d' }}>Address: <strong>{guestInfo.guest_address || 'N/A'}</strong></label>
                        </div>
                        <div className="field">
                            <label className="label" style={{ color: '#7f8c8d' }}>Country: <strong>{guestInfo.guest_country || 'N/A'}</strong></label>
                        </div>
                        <div className="field">
                            <label className="label" style={{ color: '#7f8c8d' }}>Contact Number: <strong>{guestInfo.guest_phone_no || 'N/A'}</strong></label>
                        </div>
                    </div>
                {rooms.map((room, index) => {
                const guestsPerRoom = Math.floor(totalPeople / rooms.length) || 0;
                const additionalGuest = index < totalPeople % rooms.length ? 1 : 0;
                const roomPax = guestsPerRoom + additionalGuest;

                return (
                    <div key={index} className="column is-one-third">
                        <div className="field">
                            <label className="subtitle">
                                <IoReceipt className='mr-2'/>Reservation Information - Room {room.room_number || 'N/A'}
                            </label>
                        </div>
                        <div className="field">
                            <label className="label" style={{ color: '#7f8c8d' }}>
                                Number of Nights: <strong>{totalNights || 0}</strong>
                            </label>
                        </div>
                        <div className="field">
                            <label className="label" style={{ color: '#7f8c8d' }}>
                                Rate per Night: <strong>₱{room.room_final_rate || 0}</strong>
                            </label>
                        </div>
                        <div className="field">
                            <label className="label" style={{ color: '#7f8c8d' }}>
                                Total Cost (Rate x Nights): <strong>₱{(totalNights * room.room_final_rate) || 0}</strong>
                            </label>
                        </div>
                        <div className="field">
                            <label className="label" style={{ color: '#7f8c8d' }}>
                                Check-In Date: <strong>{checkInDate || 'N/A'}</strong>
                            </label>
                        </div>
                        <div className="field">
                            <label className="label" style={{ color: '#7f8c8d' }}>
                                Check-Out Date: <strong>{checkOutDate || 'N/A'}</strong>
                            </label>
                        </div>
                        <div className="field">
                            <label className="label" style={{ color: '#7f8c8d' }}>
                                Room Type: <strong>{room.room_type_name || 'N/A'}</strong>
                            </label>
                        </div>
                        <div className="field">
                            <label className="label" style={{ color: '#7f8c8d' }}>
                                Room Pax (Guests Allowed): <strong>{roomPax}</strong>
                            </label>
                        </div>
                    </div>
                );
                })}

                {/* Booking Summary Section */}
                <div className="column is-one-third">
                        <div className="field">
                            <label className="subtitle"> <IoPencil className='mr-2'/>Other Queries</label>
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

                <div className="field">
                    <label className="label" style={{ color: '#7f8c8d' }}>Total Cost for All Rooms: <strong>₱{totalCost}</strong></label>
                </div>

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

                <div className="field is-flex is-justify-content-flex-end">
                    <button 
                        className="button is-blue" 
                        onClick={handleReservation}
                        disabled={!termsAccepted} 
                    >
                        Book Now!
                    </button>
                </div>
            </div>

            <SuccessModal isOpen={showSuccessModal} toggleModal={() => setShowSuccessModal(false)} />
            <ErrorModal isOpen={showErrorModal} toggleModal={() => setShowErrorModal(false)} />
        </section>
    );
};

export default RoomReservation;
