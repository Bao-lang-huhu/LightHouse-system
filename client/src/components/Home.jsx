import React, { useState, useEffect } from 'react';    
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import 'bulma/css/bulma.min.css';
import './pages.css';
import home_hero from '../images/hero.png';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; 
import DatePicker from 'react-datepicker'; // Import the date picker component
import 'react-datepicker/dist/react-datepicker.css';  // Import the CSS for the date picker
import moment from 'moment';  // Import moment for date formatting

const Home = () => {
    const [checkInDate, setCheckInDate] = useState(null);
    const [checkOutDate, setCheckOutDate] = useState(null);
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [numberOfRooms, setNumberOfRooms] = useState(1); 
    const [roomPhotos, setRoomPhotos] = useState([]);  
    const [foodPhotos, setFoodPhotos] = useState([]);  
    const [error, setError] = useState('');  
    const [dateError, setDateError] = useState('');  
    const navigate = useNavigate();

    // Get today's date and calculate two months ahead date
    const today = moment().toDate();
    const twoMonthsFromToday = moment().add(2, 'months').toDate();

    // Fetch rooms with MAIN photos
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/getMainRoomPhotos');
                setRoomPhotos(response.data.rooms || []);  
            } catch (error) {
                setError('Failed to load room photos');
            }
        };
        fetchRooms();
    }, []);

    // Fetch food items with active photos
    useEffect(() => {
        const fetchFoodPhotos = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/getFoodPhotos');
                setFoodPhotos(response.data.foodItems || []);  
            } catch (err) {
                setError('Failed to load food photos');
            }
        };
        fetchFoodPhotos();
    }, []);

    // Handle room search with date validation and formatted display
    const handleSearch = async () => {
        setDateError('');  // Reset any previous date errors

        if (!checkInDate || !checkOutDate) {
            setDateError('Please select both check-in and check-out dates.');
            return;
        }

        if (checkOutDate <= checkInDate) {
            setDateError('Check-out date cannot be earlier than or equal to check-in date.');
            return;
        }

        const totalGuests = parseInt(adults, 10) + parseInt(children, 10);

        try {
            const response = await axios.get('http://localhost:3001/api/getRoomsOrder', {
                params: {
                    checkIn: moment(checkInDate).format('YYYY-MM-DD'),
                    checkOut: moment(checkOutDate).format('YYYY-MM-DD'),
                    adults: adults,
                    children: children,
                }
            });

            if (response.data.rooms.length > 0) {
                navigate(`/room_search?checkIn=${moment(checkInDate).format('YYYY-MM-DD')}&checkOut=${moment(checkOutDate).format('YYYY-MM-DD')}&adults=${adults}&children=${children}&roomPax=${totalGuests}&available=true`);
            } else {
                navigate(`/room_search?checkIn=${moment(checkInDate).format('YYYY-MM-DD')}&checkOut=${moment(checkOutDate).format('YYYY-MM-DD')}&adults=${adults}&children=${children}&roomPax=${totalGuests}&available=false`);
            }
        } catch (error) {
            setError('Error fetching available rooms');
        }
    };

    return (
        <section>
            <div className="hero is-color">
                <div className="hero-body" style={{ backgroundImage: `url(${home_hero})` }}></div>
                <div className="floating-container">
                    <div className='about-white'>
                        <h3 className="has-text-centered header"><strong>LightHouse Hotel: Check-in Time: 2:00 p.m. and Check-out Time 12:00 p.m.</strong></h3>

                        <div className="checkdate">
                            <div className="input-container">
                                <p><strong>Check-In Date</strong></p>
                                <DatePicker
                                    selected={checkInDate}
                                    onChange={(date) => {
                                        setCheckInDate(date);
                                        setCheckOutDate(null);  // Clear check-out date when check-in changes
                                    }}
                                    minDate={today}
                                    maxDate={twoMonthsFromToday}
                                    selectsStart
                                    startDate={checkInDate}
                                    endDate={checkOutDate}
                                    dateFormat="MMM d, yyyy"
                                    placeholderText="Select check-in date"
                                />
                                {checkInDate && <p>{moment(checkInDate).format('MMMM D, YYYY')}</p>} 
                            </div>
                            <div className="input-container">
                                <p><strong>Check-Out Date</strong></p>
                                <DatePicker
                                    selected={checkOutDate}
                                    onChange={(date) => setCheckOutDate(date)}
                                    minDate={checkInDate || today}
                                    maxDate={checkInDate ? moment(checkInDate).add(2, 'months').toDate() : twoMonthsFromToday}
                                    selectsEnd
                                    startDate={checkInDate}
                                    endDate={checkOutDate}
                                    dateFormat="MMM d, yyyy"
                                    placeholderText="Select check-out date"
                                />
                                {checkOutDate && <p>{moment(checkOutDate).format('MMMM D, YYYY')}</p>}
                            </div>
                        </div>

                        <div className="room_choice">
                            <div className="input-container">
                                <p><strong>Number of Adults</strong></p>
                                <input 
                                    type="number" 
                                    value={adults} 
                                    min="1" 
                                    onChange={(e) => setAdults(e.target.value)} 
                                    required 
                                />
                            </div>
                            <div className="input-container">
                                <p><strong>Number of Children</strong></p>
                                <input 
                                    type="number" 
                                    value={children} 
                                    min="0" 
                                    onChange={(e) => setChildren(e.target.value)} 
                                    required 
                                />
                            </div>

                            <div className="input-container">
                                <p><strong>Number of Rooms</strong></p>
                                <input 
                                    type="number"
                                    value={numberOfRooms}
                                    min="1" 
                                    onChange={(e) => setNumberOfRooms(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        {/* Date Error Message */}
                        {dateError && <p className="label has-text-centered" style={{color:"red"}}>{dateError}</p>}

                    </div>

                    <div className="buttons is-centered">
                        <button className="button is-blue search" onClick={handleSearch}>SEARCH</button>
                    </div>
                </div>
            </div>
            <div className="property-views-container">
                <h4><strong>Rooms</strong></h4>
                <h3>LightHouse Point Hotel offers a variety of rooms.</h3>

                <Carousel 
                    autoPlay 
                    infiniteLoop 
                    showThumbs={false} 
                    showStatus={false}
                    dynamicHeight={false} 
                >
                    {roomPhotos.map((room, index) => {
                        const roomDetails = room.ROOM || {}; 
                        return (
                            <div key={index} className="carousel-item">
                                <img 
                                    src={room.room_photo_url || 'https://via.placeholder.com/300'} 
                                    alt={`Room ${roomDetails.room_type_name || ''}`} 
                                    className="carousel-image"
                                    style={{ maxWidth: '100%', height: 'auto' }}
                                />
                                <div className="legend" style={{background:"#99DCEB", opacity:"1"}}>
                                    <h2 className='label'>{`${roomDetails.room_type_name || 'N/A'}`}</h2>
                                    <p className='label'>{`Room Number: ${roomDetails.room_number || 'N/A'}`}</p>
                                </div>
                            </div>
                        );
                    })}
                </Carousel>
            </div>

            <div className="property-views-container">
                <h4><strong>Captain Galley's Menu Items</strong></h4>
                <h3>LightHouse Point Hotel offers a variety of delicious dishes.</h3>

                <Carousel
                    autoPlay
                    infiniteLoop
                    showThumbs={false}
                    showStatus={false}
                    dynamicHeight={false}
                    centerMode
                    centerSlidePercentage={33}
                >
                    {foodPhotos.map((food, index) => (
                        <div key={index} className="carousel-item">
                            <img
                                src={food.food_photo || 'https://via.placeholder.com/300'}
                                alt={`Food Item: ${food.food_name}`}
                                className="carousel-image"
                                style={{ maxWidth: '100%', height: 'auto' }}
                            />
                            <div className="legend" style={{ background: "#99DCEB", opacity: "1" }}>
                                <h4 className='label'>{food.food_name || 'N/A'}</h4>
                                <p className='label'>{`Price: ₱${food.food_final_price || 'N/A'}`}</p>
                            </div>
                        </div>
                    ))}
                </Carousel>
            </div>
        </section>
    );
};

export default Home;
