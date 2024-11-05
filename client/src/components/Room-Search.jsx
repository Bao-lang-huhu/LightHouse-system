import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; 
import 'bulma/css/bulma.min.css';
import './pages.css';
import '../App.css';
import Breadcrumbs from '../layouts/Breadcrumbs';
import { ClipLoader } from 'react-spinners';

const RoomSearch = () => {
    const breadcrumbItems = [
        { label: 'Home', link: '/' },
        { label: 'Room Search' },
    ];

    const [rooms, setRooms] = useState([]);
    const [noRoomsAvailable, setNoRoomsAvailable] = useState(false);
    const [mainImages, setMainImages] = useState({});
    const [isGuestLoggedIn, setIsGuestLoggedIn] = useState(false);
    const [suggestedRooms, setSuggestedRooms] = useState([]);
    const [totalPeople, setTotalPeople] = useState(0);
    const [selectedRooms, setSelectedRooms] = useState([]);
    const [numberOfRooms, setNumberOfRooms] = useState(1);
    const [loading, setLoading] = useState(true);
    const [noRoomsAvailableMessage, setNoRoomsAvailableMessage] = useState(''); // Define state for message


    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const checkInDate = queryParams.get('checkIn');
    const checkOutDate = queryParams.get('checkOut');
    const adults = parseInt(queryParams.get('adults')) || 0;
    const children = parseInt(queryParams.get('children')) || 0;
    const available = queryParams.get('available');
    const roomsNeeded = parseInt(queryParams.get('numberOfRooms')) || 1;
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
    
        const guests = adults + children;
        setNumberOfRooms(roomsNeeded);
        setTotalPeople(guests);
    
        // Call calculateRoomSuggestion with updated values directly
        if (available === 'false') {
            calculateRoomSuggestion(guests, roomsNeeded); // Pass guests and roomsNeeded explicitly
            setNoRoomsAvailable(true);
            setLoading(false);
            return;
        }
    
        const fetchAvailableRooms = async () => {
            try {
                const response = await axios.get(`https://light-house-system-h74t-server.vercel.app/api/getRoomsOrder`, {
                    params: { checkIn: checkInDate, checkOut: checkOutDate, adults, children }
                });
                let fetchedRooms = response.data.rooms; // Changed const to let
            
                if (fetchedRooms.length > 0) {
                    // Sort rooms by room_pax_max in descending order
                    fetchedRooms = fetchedRooms.sort((a, b) => b.room_pax_max - a.room_pax_max);
        
                    const initialMainImages = fetchedRooms.reduce((acc, room) => {
                        acc[room.room_id] = room?.images?.main || 'https://via.placeholder.com/600x400';
                        return acc;
                    }, {});
                    
                    setMainImages(initialMainImages);
                    setRooms(fetchedRooms);
                } else {
                    setNoRoomsAvailable(true);
                    calculateRoomSuggestion(guests, roomsNeeded); // Pass guests and roomsNeeded explicitly
                }
            } catch (error) {
                console.error('Error fetching rooms:', error);
                setNoRoomsAvailable(true);
                calculateRoomSuggestion(guests, roomsNeeded);
            } finally {
                setLoading(false);
            }
        };
        
    
        fetchAvailableRooms();
    }, [checkInDate, checkOutDate, adults, children, available]);
    
    const calculateRoomSuggestion = (totalGuests, roomsNeeded) => {
        const roomOptions = [
            { type: 'Suite', paxMax: 4 },
            { type: 'Deluxe', paxMax: 3 },
            { type: 'Standard', paxMax: 2 }
        ];
    
        const peoplePerRoom = Math.floor(totalGuests / roomsNeeded);
        const extraPeople = totalGuests % roomsNeeded;
        const selectedRoomCombination = [];
        let remainingRooms = roomsNeeded;
        let roomIndex = 0;
    
        console.log(`Calculating suggestions for ${totalGuests} guests with ${roomsNeeded} rooms`);
    
        while (remainingRooms > 0 && roomIndex < roomOptions.length) {
            const room = roomOptions[roomIndex];
            const guestsInThisRoom = peoplePerRoom + (selectedRoomCombination.length < extraPeople ? 1 : 0);
    
            if (guestsInThisRoom <= room.paxMax) {
                selectedRoomCombination.push({
                    type: room.type,
                    paxMax: room.paxMax,
                    guests: guestsInThisRoom,
                });
                remainingRooms -= 1;
            } else {
                roomIndex += 1;
            }
        }
    
        // If no suitable room combination was found, show a message
        if (selectedRoomCombination.length < roomsNeeded) {
            setNoRoomsAvailable(true);
            setSuggestedRooms([]);
            setNoRoomsAvailableMessage(
                `The number of guests (${totalGuests}) and rooms (${roomsNeeded}) exceeds available room options. Please adjust the number of guests or rooms.`
            );
        } else {
            setNoRoomsAvailable(false);
            setSuggestedRooms(selectedRoomCombination);
            setNoRoomsAvailableMessage('');
        }
    };
    
    
      
    const handleImageClick = (roomId, image) => {
        setMainImages(prevMainImages => ({
            ...prevMainImages,
            [roomId]: image,
        }));
    };

    const handleRoomSelect = (room) => {
        if (selectedRooms.length < numberOfRooms) {
            setSelectedRooms(prev => [...prev, room]);
        }
    };

    const handleRoomDeselect = (room) => {
        setSelectedRooms(prev => prev.filter(selectedRoom => selectedRoom.room_id !== room.room_id));
    };

    const handleBookNow = () => {
        if (!isGuestLoggedIn) {
            navigate('/login', { state: { from: `/room_search` } });
        } else {
            const guestsPerRoom = Math.floor(totalPeople / numberOfRooms);
            const extraGuests = totalPeople % numberOfRooms;
    
            // Apply the calculated guests per room distribution
            const selectedRoomsWithGuests = selectedRooms.map((room, index) => ({
                ...room,
                room_pax: guestsPerRoom + (index < extraGuests ? 1 : 0)
            }));
    
            navigate('/room_search/book_room_reservations', {
                state: { rooms: selectedRoomsWithGuests, checkInDate, checkOutDate, totalPeople }
            });
        }
    };
    
    

    const handleViewRoomDetails = (room) => {
        navigate(`/room_details/${room.room_id}`, {
            state: { checkInDate, checkOutDate, adults, children }
        });
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

            <div style={{ margin: '20px' }}>
                {loading ? (
                    <div className="loader-container" style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
                        <ClipLoader color="#007bff" size={50} />
                    </div>
                ) : noRoomsAvailable ? (
                    <div className="container box m-1">
                        {noRoomsAvailableMessage ? (
                            <p>{noRoomsAvailableMessage}</p>
                        ) : (
                            <>
                                <p>No rooms available for the selected dates. We suggest booking the following combination of rooms for a group of {totalPeople} people:</p>
                                <ul>
                                    {suggestedRooms.map((room, index) => (
                                        <li key={index}>{room.type} room (Max {room.paxMax} guests)</li>
                                    ))}
                                </ul>
                                <p>Please adjust your search criteria or select from the recommended options above.</p>
                            </>
                        )}
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
                                                        src={mainImages[room.room_id]}  
                                                        alt="Room"
                                                        className="main-img"
                                                    />
                                                </figure>
                                            </div>
                                            <div className="thumbnails-container">
                                                <figure className="image is-64x64">
                                                    <img
                                                        src={room?.images?.main || 'https://via.placeholder.com/600x400'}
                                                        alt="Main Thumbnail"
                                                        onClick={() => handleImageClick(room.room_id, room?.images?.main)}
                                                        className="thumbnail-img"
                                                    />
                                                </figure>
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

                                    <div className="column is-full-mobile is-half-desktop">
                                        <div className="box">
                                            <div className="card-content">
                                                <h2 className="title">{room.room_type_name}</h2>
                                                <p className="subtitle">Room {room.room_number}</p>
                                                <p style={{fontSize:"1.5rem"}}>Price: <strong>₱{room.room_final_rate}</strong> per night</p>
                                                <p className={`status-label `}>
                                                 Original rate per night :{room.room_rate}
                                                </p>
                                                <p className={`status-label `} style={{color:"red"}}>
                                                    {room.room_disc_percentage} % discount off now
                                                </p>
                                                <p className='mt-1 mb-1' style={{fontSize:"1rem"}}>
                                                Breakfast Availability: {room.room_breakfast_availability}
                                                </p>
                                                <button
                                                    className={`button is-fullwidth ${selectedRooms.includes(room) ? 'is-inverted-blue' : 'is-blue'}`}
                                                    onClick={() => selectedRooms.includes(room) ? handleRoomDeselect(room) : handleRoomSelect(room)}
                                                    disabled={selectedRooms.length >= numberOfRooms && !selectedRooms.includes(room)}
                                                >
                                                    {selectedRooms.includes(room) ? 'Deselect' : 'Select Room'}
                                                </button>
                                            </div>
                                            <div className="card-content section-p1">
                                            <ul className="limited-bullet-list">
                                                <li>Max Number of Guest: {room.room_pax_max}</li>
                                                <li>{room.room_description}</li>
                                            </ul>                                          
                                                <button className="button is-inverted-blue is-small" onClick={() => handleViewRoomDetails(room)}>See Full Details</button>
                                        </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="floating-button-container">
                            <button
                                className="button is-blue"
                                onClick={handleBookNow}
                                disabled={selectedRooms.length < numberOfRooms}
                            >
                                Book Now ({selectedRooms.length}/{numberOfRooms} selected)
                            </button>
                        </div>

                    </>
                )}
            </div>
        </section>
    );
};

export default RoomSearch;
