import React, { useEffect, useState } from 'react';   
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; // Import jwt-decode for token decoding
import 'bulma/css/bulma.min.css';
import './pages.css';
import '../App.css';
import Breadcrumbs from '../layouts/Breadcrumbs';

const RoomSearch = () => {
    const breadcrumbItems = [
        { label: 'Home', link: '/' },
        { label: 'Room Search' },
    ];

    const [rooms, setRooms] = useState([]);
    const [noRoomsAvailable, setNoRoomsAvailable] = useState(false);  
    const [mainImages, setMainImages] = useState({}); 
    const [isGuestLoggedIn, setIsGuestLoggedIn] = useState(false); 

    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const checkInDate = queryParams.get('checkIn');
    const checkOutDate = queryParams.get('checkOut');
    const adults = queryParams.get('adults');
    const children = queryParams.get('children');
    const available = queryParams.get('available');  

    useEffect(() => {
        const token = localStorage.getItem('token'); 

        if (token) {
            try {
                const decodedToken = jwtDecode(token); // Decode the token
                if (decodedToken.guest_id) {
                    setIsGuestLoggedIn(true); // User is logged in as a guest
                } else {
                    setIsGuestLoggedIn(false);
                }
            } catch (error) {
                console.error('Error decoding token:', error);
                setIsGuestLoggedIn(false);
            }
        }

        if (available === 'false') {
            setNoRoomsAvailable(true);  // Set no rooms available message
            return;
        }

        // Fetch available rooms based on the provided search parameters
        const fetchAvailableRooms = async () => {
            try {
                const response = await axios.get(`https://light-house-system-h74t-server.vercel.app/api/getRoomsOrder`, {
                    params: { checkIn: checkInDate, checkOut: checkOutDate, adults, children }
                });

                const fetchedRooms = response.data.rooms;

                if (fetchedRooms.length > 0) {
                    // Initialize main images for each room
                    const initialMainImages = fetchedRooms.reduce((acc, room) => {
                        acc[room.room_id] = room?.images?.main || 'https://via.placeholder.com/600x400';
                        return acc;
                    }, {});
                    setMainImages(initialMainImages);
                    setRooms(fetchedRooms);
                } else {
                    setNoRoomsAvailable(true);  // No rooms available for the selected dates
                }
            } catch (error) {
                console.error('Error fetching rooms:', error);
                setNoRoomsAvailable(true);  // Show message if there's an error
            }
        };

        fetchAvailableRooms();
    }, [checkInDate, checkOutDate, adults, children, available]);

    // Handle clicking on thumbnails for a specific room
    const handleImageClick = (roomId, image) => {
        setMainImages(prevMainImages => ({
            ...prevMainImages,
            [roomId]: image,  // Update main image for the specific room
        }));
    };

    const handleBookNow = (room) => {
        if (!isGuestLoggedIn) {
            // Redirect to login page if not logged in
            navigate('/login', {
                state: { from: `/room_search` }  // Save the current page to navigate back after login
            });
        } else {
            // If guest is logged in, proceed to RoomReservation with selected room and date data
            navigate('/room_search/book_room_reservations', {
                state: { room, checkInDate, checkOutDate }
            });
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'OCCUPIED':
                return 'Occupied';
            case 'UNDER MAINTENANCE':
                return 'Under Maintenance';
            case 'INACTIVE':
                return 'Inactive';
            case 'DELETE':
                return 'Deleted';
            case 'AVAILABLE':
            default:
                return 'Available';
        }
    };

    return (
        <section className='section-m1'>
            <div className="contact-hero-image">
                <div className="text-content-title">
                    <h1 className='title'>Rooms</h1>
                </div>
            </div>
            <div>
                <Breadcrumbs items={breadcrumbItems} />
            </div>

            {noRoomsAvailable ? (
                <div className="container box m-1">
                    <p>No rooms available for the selected dates. Please try different dates.</p>
                </div>
            ) : (
                <>
                    <h2 className="title is-4">Available Rooms</h2>
                    {rooms.map((room) => (
                        <div className="container box m-1" key={room.room_id}>
                            <div className="columns is-multiline is-centered">
                                <div className="column is-full-mobile is-half-desktop">
                                    <div className="box image-gallery-container">  
                                        <div className="card-image main-image-container">
                                            <figure className="image main-image">
                                                <img 
                                                    src={mainImages[room.room_id]}  // Display main image specific to the room
                                                    alt="Room"
                                                    className="main-img"
                                                />
                                            </figure>
                                        </div>
                                        <div className="thumbnails-container">
                                            {/* Main image displayed at the start of thumbnails */}
                                            <figure className="image is-64x64">
                                                <img
                                                    src={room?.images?.main || 'https://via.placeholder.com/600x400'}
                                                    alt="Main Thumbnail"
                                                    onClick={() => handleImageClick(room.room_id, room?.images?.main)}
                                                    className="thumbnail-img"
                                                />
                                            </figure>

                                            {/* Extra images */}
                                            {room.images.extra && room.images.extra.length > 0 ? (
                                                room.images.extra.map((image, idx) => (
                                                    <figure className="image is-64x64" key={idx}>
                                                        <img
                                                            src={image}
                                                            alt={`Thumbnail ${idx + 1}`}
                                                            onClick={() => handleImageClick(room.room_id, image)}
                                                            className="thumbnail-img"
                                                        />
                                                    </figure>
                                                ))
                                            ) : (
                                                <p>No extra photos available</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Room Details */}
                                <div className="column is-full-mobile is-half-desktop">
                                    <div className="box">
                                        <div className="card-content">
                                            <h2 className="title">{room.room_type_name}</h2>
                                            <p className="subtitle">Room {room.room_number} </p>
                                            <p style={{fontSize:"1.5rem"}}>Price: ₱{room.room_final_rate} per night</p>
                                            <p className={`status-label `}>
                                                 Original rate per night :{room.room_rate}
                                            </p>
                                            <p className={`status-label `} style={{color:"red"}}>
                                                 {room.room_disc_percentage} % discount off now
                                            </p>
                                            <p className={`status-label status-${room.room_status.toLowerCase()}`}>
                                                Status: {getStatusLabel(room.room_status)} for reservation
                                            </p>

                                            <p className='mt-1 mb-1' style={{fontSize:"1rem"}}>
                                               Available Breakfast : {room.room_breakfast_availability}
                                            </p>

                                            <button
                                                className="button is-fullwidth"
                                                onClick={() => handleBookNow(room)}
                                            >
                                                {isGuestLoggedIn ? 'Book Now' : 'Sign in for reservation'}
                                            </button>
                                        </div>
                                        <div className="card-content section-p1">
                                            <ul className="limited-bullet-list">
                                                <li>Max Number of Guest: {room.room_pax_max}</li>
                                                <li>{room.room_description}</li>
                                            </ul>
                                            <Link to={`/room_search/room_details/${room.room_id}`}>
                                                <button className="button is-inverted-blue is-small">See Full Details</button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </>
            )}
        </section>
    );
};

export default RoomSearch;
