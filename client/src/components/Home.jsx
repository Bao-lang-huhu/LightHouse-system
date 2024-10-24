import React, { useState, useEffect } from 'react';    
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios'; 
import 'bulma/css/bulma.min.css';
import './pages.css';
import home_hero from '../images/hero.png';
import { Carousel } from 'react-responsive-carousel';
import { Card, CardMedia, CardContent, Typography } from '@mui/material';
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
    const [loading, setLoading] = useState(false);


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
    
        setLoading(true); // Set loading to true when search starts
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
        } finally {
            setLoading(false); // Reset loading when the search is complete
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
                                        setCheckOutDate(null);  
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
                            {/* Number of Adults */}
                            <div className="input-container">
                                <p><strong>Number of Adults</strong></p>
                                <div className="control is-flex is-align-items-center">
                                    {/* Decrease Button */}
                                    <button
                                        className="button is-blue mr-2"
                                        onClick={() => {
                                            if (adults > 1) {
                                                setAdults((prev) => prev - 1);
                                            }
                                        }}
                                        disabled={adults <= 1} // Disable button when adults are 1 or less
                                    >
                                        -
                                    </button>

                                    {/* Display Current Number of Adults */}
                                    <span className="button is-static">{adults}</span>

                                    {/* Increase Button */}
                                    <button
                                        className="button is-blue ml-2"
                                        onClick={() => {
                                            if (adults < 10) {
                                                setAdults((prev) => prev + 1);
                                            }
                                        }}
                                        disabled={adults >= 10} // Disable button when adults are 10 or more
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Number of Children */}
                            <div className="input-container">
                                <p><strong>Number of Children</strong></p>
                                <div className="control is-flex is-align-items-center">
                                    {/* Decrease Button */}
                                    <button
                                        className="button is-blue mr-2"
                                        onClick={() => {
                                            if (children > 0) {
                                                setChildren((prev) => prev - 1);
                                            }
                                        }}
                                        disabled={children <= 0} // Disable button when children are 0
                                    >
                                        -
                                    </button>

                                    {/* Display Current Number of Children */}
                                    <span className="button is-static">{children}</span>

                                    {/* Increase Button */}
                                    <button
                                        className="button is-blue ml-2"
                                        onClick={() => {
                                            if (children < 10) {
                                                setChildren((prev) => prev + 1);
                                            }
                                        }}
                                        disabled={children >= 10} // Disable button when children are 10 or more
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Number of Rooms */}
                            <div className="input-container">
                                <p><strong>Number of Rooms</strong></p>
                                <div className="control is-flex is-align-items-center">
                                    {/* Decrease Button */}
                                    <button
                                        className="button is-blue mr-2"
                                        onClick={() => {
                                            if (numberOfRooms > 1) {
                                                setNumberOfRooms((prev) => prev - 1);
                                            }
                                        }}
                                        disabled={numberOfRooms <= 1} // Disable button when numberOfRooms is 1 or less
                                    >
                                        -
                                    </button>

                                    {/* Display Current Number of Rooms */}
                                    <span className="button is-static">{numberOfRooms}</span>

                                    {/* Increase Button */}
                                    <button
                                        className="button is-blue ml-2"
                                        onClick={() => {
                                            if (numberOfRooms < 5) {
                                                setNumberOfRooms((prev) => prev + 1);
                                            }
                                        }}
                                        disabled={numberOfRooms >= 5} // Disable button when numberOfRooms are 5 or more
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                        </div>
                        {/* Date Error Message */}
                        {dateError && <p className="label has-text-centered has-text-danger" >*{dateError}</p>}

                    </div>

                    <div className="buttons is-centered">
                        <button className="button is-blue search" onClick={handleSearch} disabled={loading}>
                            {loading ? (
                                <span className=" is-small">
                                    <i className="fas fa-spinner fa-spin" style={{color:"blue"}}></i> {/* FontAwesome spinner icon */}
                                </span>
                            ) : 'SEARCH'}
                        </button>
                    </div>

                </div>
            </div>

            <div className="property-views-container section-m2">
                <h4><strong>Rooms</strong></h4>
                <h3>LightHouse Point Hotel offers a variety of rooms.</h3>

                <Carousel 
                    autoPlay 
                    infiniteLoop 
                    showThumbs={false} 
                    showStatus={false}
                    dynamicHeight={false} 
                    centerMode
                    centerSlidePercentage={33}
                >
                    {roomPhotos.map((room, index) => {
                    const roomDetails = room.ROOM || {}; 
                    return (
                        <div key={index} className="carousel-item" style={{ padding: '10px' }}>
                            <Card 
                                sx={{ 
                                    maxWidth: 300, 
                                    margin: 'auto', 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    justifyContent: 'center', 
                                    alignItems: 'center' 
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    image={room.room_photo_url || 'https://via.placeholder.com/300'}
                                    alt={`Room ${roomDetails.room_type_name || ''}`}
                                    style={{ height: '300px', width: 'auto' }}
                                />
                                <CardContent 
                                    style={{ 
                                        backgroundColor: "#99DCEB", 
                                        opacity: "0.9", 
                                        textAlign: 'center' 
                                    }}
                                >
                                    <Typography variant="h4" className='label'>
                                        {roomDetails.room_type_name || 'N/A'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </div>
                    );
                })}
                </Carousel>
                <div>
                    <Link to="/virtual_tour">
                    <button className='button is-blue is-fullwidth'>
                        Take a Tour to our Rooms 
                    </button></Link>
                </div>
            </div>

            <div className="property-views-container section-m2">
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
                      
                        <div key={index} className="carousel-item" style={{ padding: '10px' }}>
                        <Card 
                            sx={{ 
                                maxWidth: 300, 
                                margin: 'auto', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                justifyContent: 'center', 
                                alignItems: 'center' 
                            }}
                        >
                            <CardMedia
                                component="img"
                                image={food.food_photo || 'https://via.placeholder.com/300'}
                                alt={`Food Item:${ food.food_name || ' '}`}
                                style={{ height: '300px', width: 'auto' }}
                            />
                            <CardContent 
                                style={{ 
                                    backgroundColor: "#99DCEB", 
                                    opacity: "0.9", 
                                    textAlign: 'center' 
                                }}
                            >
                                <Typography variant="h4" className='label'>
                                    {food.food_name || 'No Food'}- {`Price: ₱${food.food_final_price || 'No Price'}`}
                                </Typography>
                            </CardContent>
                        </Card>
                        </div>
                    ))}
                </Carousel>
              
            </div>

         


        </section>
    );
};

export default Home;
