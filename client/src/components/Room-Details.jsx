import React, { useEffect, useState, useRef } from 'react';    
import 'bulma/css/bulma.min.css';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import './pages.css';
import '../App.css';
import Breadcrumbs from '../layouts/Breadcrumbs';
import VirtualTour from '../components/VirtualTour'; 
import { Card, CardMedia } from '@mui/material'; 
import { jwtDecode } from 'jwt-decode'; 

const RoomDetails = () => {
    const [roomDetails, setRoomDetails] = useState(null);
    const [virtualTour, setVirtualTour] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const roomDetailsRef = useRef(); 

    const { roomId } = useParams(); 
    const navigate = useNavigate();
    const location = useLocation();

    // Get data passed from RoomSearch
    const { checkInDate, checkOutDate, adults, children } = location.state || {};

    const [isGuestLoggedIn, setIsGuestLoggedIn] = useState(false); 

    const breadcrumbItems = [
        { label: 'Home', link: '/' },
        { label: 'Room Search', link: '/room_search' },
        { label: 'Room Details' },
    ];

    useEffect(() => {
        const token = localStorage.getItem('token'); 
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setIsGuestLoggedIn(!!decodedToken.guest_id);
            } catch (error) {
                console.error('Error decoding token:', error);
                setIsGuestLoggedIn(false);
            }
        }

        const fetchRoomDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/room_details/${roomId}`);
                setRoomDetails(response.data);
                fetchVirtualTour(response.data.room.room_type_name);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchVirtualTour = async (roomTypeName) => {
            try {
                const response = await axios.get('http://localhost:3001/api/getRoomVirtualTourByTypeName', {
                    params: { vt_name: roomTypeName }
                });
                setVirtualTour(response.data.length > 0 ? response.data[0] : null);
            } catch (error) {
                console.error('Error fetching virtual tour:', error);
            }
        };

        fetchRoomDetails();
    }, [roomId]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <ClipLoader color="#00d1b2" size={50} />
            </div>
        );
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const handleBookNow = (room) => {
        if (!isGuestLoggedIn) {
            navigate('/login', {
                state: { from: location.pathname } 
            });
        } else {
            navigate('/room_search/book_room_reservations', {
                state: { room, checkInDate, checkOutDate, adults, children }
            });
        }
    };

    const { room, photos } = roomDetails;

    return (
        <section className='section-m1'>
            <div>
                <Breadcrumbs items={breadcrumbItems} />
            </div>
            <div className='is-flex is-justify-content-center is-align-items-center'>
                <div className="container box m-1 room-details-container">
                    <div className="columns is-variable is-6 mb-4">
                        {/* Room Details Section */}
                        <div className="column is-half" ref={roomDetailsRef}>
                            <Card style={{ width: '100%', height: 'auto' }}>
                                <CardMedia
                                    component="img"
                                    image={photos.length > 0 ? photos[0].room_photo_url : "https://via.placeholder.com/1024x533"}
                                    alt="Room"
                                    style={{ 
                                        width: '100%', 
                                        height: 'auto', 
                                        objectFit: 'cover' 
                                    }}
                                />
                            </Card>

                            <div className="room-info">
                                <h2 className="subtitle is-5">Room {room.room_number}</h2>
                                <h3 className="title is-4">{room.room_type_name}</h3>
                                <p className="price is-5">
                                    Price per night: 
                                    <span style={{ textDecoration: 'line-through', marginRight: '8px' }}>
                                        ₱{room.room_rate}
                                    </span>
                                    <span className='is-size-3 has-blue-text'>₱{room.room_final_rate}</span>
                                </p>
                                <button
                                    className="button is-fullwidth is-blue"
                                    onClick={() => handleBookNow(room)}
                                >
                                    {isGuestLoggedIn ? 'Book Now' : 'Sign in for reservation'}
                                </button>

                                <p className="price is-5"> {room.room_disc_percentage} % discount off now</p>
                                <p className='mt-1 mb-1' style={{fontSize:"1rem"}}>Breakfast Availability: {room.room_breakfast_availability} </p>
                            </div>
                        </div>

                        {/* Virtual Tour Section */}
                        <div className="column is-half"
                        style={{ 
                            position: 'relative',
                            height: roomDetailsRef.current ? roomDetailsRef.current.clientHeight : 'auto',
                            overflow: 'hidden', 
                            marginTop: "0",
                            height:"50%",
                        }}>
                        <div style={{ width: '100%', height: '50%', position: 'relative' }}>

                            <VirtualTour style={{height:"50%"}} />
                            <a href="/virtual_tour" target="_blank" rel="noopener noreferrer">
                                <button className='button is-blue'    
                                    style={{ 
                                        position: 'absolute', 
                                        top: '50%', 
                                        left: '50%', 
                                        transform: 'translate(-50%, -50%)', 
                                        cursor: 'pointer',
                                        textAlign: 'center'
                                    }}> 
                                    See Virtual Tour of Rooms
                                </button>
                            </a>
                            </div>
                        </div>
                    </div>
                     {/* Room Features */}
                 <div className="columns is-multiline room-features">
                        <div className="column is-half-tablet is-one-quarter-desktop">
                            <ul className="room-details-list">
                                <li>Free Wi-Fi</li>
                                <li>Flat-screen TV</li>
                                <li>Air Conditioning</li>
                                <li>Mini Bar</li>
                            </ul>
                        </div>
                        <div className="column is-half-tablet is-one-quarter-desktop">
                            <ul className="room-details-list">
                                <li>24/7 Security</li>
                                <li>Smoke Detector</li>
                                <li>Electronic Safe</li>
                                <li>Room Service</li>
                            </ul>
                        </div>
                        <div className="column is-half-tablet is-one-quarter-desktop">
                            <ul className="room-details-list">
                                <li>Swimming Pool Access</li>
                                <li>Fitness Center Access</li>
                                <li>Complimentary Breakfast</li>
                                <li>Laundry Service</li>
                            </ul>
                        </div>
                        <div className="column is-half-tablet is-one-quarter-desktop">
                            <ul className="room-details-list">
                                <li>Free Parking</li>
                                <li>Concierge Service</li>
                                <li>Daily Housekeeping</li>
                                <li>Airport Shuttle</li>
                            </ul>
                        </div>
                    </div>
                    <div>
                        <p className="price is-5"> {room.room_description}</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RoomDetails;
