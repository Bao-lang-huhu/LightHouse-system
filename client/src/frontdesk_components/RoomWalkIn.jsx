import React, { useState } from 'react';
import 'bulma/css/bulma.min.css';
import './components_f.css';
import '../App.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker'; 
import 'react-datepicker/dist/react-datepicker.css'; 
import moment from 'moment'; 
import { Card, CardContent, CardMedia, Typography, Button, Grid } from '@mui/material';

function RoomWalkIn() {
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState('');
  const [dateError, setDateError] = useState('');
  const [noRoomsAvailable, setNoRoomsAvailable] = useState(false); 
  const navigate = useNavigate();

  const today = moment().toDate(); 
  const twoMonthsFromToday = moment().add(2, 'months').toDate(); 

  const handleSearch = async () => {
    setDateError('');  // Reset any previous date errors
    setNoRoomsAvailable(false); // Reset no rooms available message

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
        },
      });

      const fetchedRooms = response.data.rooms;

      if (fetchedRooms.length > 0) {
        setRooms(fetchedRooms);
        setNoRoomsAvailable(false); 
      } else {
        setRooms([]); 
        setNoRoomsAvailable(true); 
      }
    } catch (error) {
      setError('Error fetching available rooms');
    }
  };

  const handleClear = () => {
    // Reset all input fields
    setCheckInDate(null);
    setCheckOutDate(null);
    setAdults(1);
    setChildren(0);
    setRooms([]);
    setDateError('');
    setError('');
    setNoRoomsAvailable(false);
  };

  const handleBookNow = (room) => {
    navigate('/frontdesk_room_walk_in/room_booking', {
        state: { room, checkInDate, checkOutDate }
    });
};


  return (
    <section className='section-p1'>
      <header>
        <div style={{ backgroundColor: 'white', borderRadius: '10px 10px' }}>
          <div className='column'>
            <h1 className='subtitle'>
              <strong>Room Walk-In Reservation</strong>
            </h1>
          </div>
          <div className="checkdate">
            <div className="input-container">
              <p><strong>Check-In Date</strong></p>
              <DatePicker
                selected={checkInDate}
                onChange={(date) => {
                  setCheckInDate(date);
                  setCheckOutDate(null);  // Reset check-out date when check-in changes
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

          </div>

          {dateError && <p className="has-text-danger">{dateError}</p>}
          {error && <p className="has-text-danger">{error}</p>}

          <div className="buttons is-centered">
            <button className="button is-blue search" onClick={handleSearch}>
              SEARCH
            </button>
            <button className="button is-inverted-blue search clear" onClick={handleClear}>
              CLEAR
            </button>
          </div>
        </div>
        <hr />
      </header>

      <div>
        {noRoomsAvailable ? (
          <Typography variant="body1">No rooms available for the selected dates or the number of guest.</Typography>
        ) : (
          <Grid container spacing={3}>
            {rooms.map((room, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardMedia
                    component="img"
                    height="140"
                    image={room.images.main || 'https://via.placeholder.com/128'}
                    alt={`Room ${room.roomNumber}`}
                  />
                  <CardContent>
                    <Typography variant="h5" component="div">
                      Room {room.room_number}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                      {room.room_type_name}
                    </Typography>
                  
                    <Typography variant="body2" color="textSecondary">
                      Max People: {room.room_pax_max}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Rate: ₱{room.room_rate}/night
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Final Rate: ₱{room.room_final_rate}/night{' '}
                      <span style={{ color: 'red' }}>{room.room_disc_percentage}% off</span>
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={() => handleBookNow(room)}
                      style={{ marginTop: '10px' }}
                    >
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </div>
    </section>
  );
}

export default RoomWalkIn;
