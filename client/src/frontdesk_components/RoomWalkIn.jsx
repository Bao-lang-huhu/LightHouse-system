import React, { useState } from 'react';
import 'bulma/css/bulma.min.css';
import './components_f.css';
import '../App.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker'; 
import 'react-datepicker/dist/react-datepicker.css'; 
import moment from 'moment';  

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
      const response = await axios.get('https://light-house-system-h74t-server.vercel.app/api/getRoomsOrder', {
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
          </div>

          <div className="room_choice">
            <div className="input-container">
              <p><strong>Number of Adults</strong></p>
              <input
                type="number"
                id="number-of-adults"
                name="number-of-adults"
                min="1"
                value={adults}
                onChange={(e) => setAdults(e.target.value)}
              />
            </div>
            <div className="input-container">
              <p><strong>Number of Children</strong></p>
              <input
                type="number"
                id="number-of-children"
                name="number-of-children"
                min="0"
                value={children}
                onChange={(e) => setChildren(e.target.value)}
              />
            </div>
          </div>

          {dateError && <p className="has-text-danger">{dateError}</p>}
          {error && <p className="has-text-danger">{error}</p>}

          <div className="buttons is-centered">
            <button className="button is-blue search" onClick={handleSearch}>
              SEARCH
            </button>
          </div>
        </div>
        <hr />
      </header>

      <div className="columns is-vcentered">
        {noRoomsAvailable ? (
          <p>No rooms available for the selected dates.</p>
        ) : (
          rooms.map((room, index) => (
            <div key={index} className="column">
              <div className="card is-fullwidth" style={{ width: '100%' }}>
                <div className="card-content" style={{ padding: '0', width: '100%' }}>
                  <div className="media" style={{ backgroundColor: 'white', margin: '0' }}>
                    <div className="media-left">
                      <figure className="image is-128x128">
                        {/* Display the MAIN image or fallback to a placeholder */}
                        <img 
                          src={room.images.main || 'https://via.placeholder.com/128'} 
                          alt={`Room ${room.roomNumber}`} 
                        />
                      </figure>
                    </div>
                    <div className="media-content" style={{ padding: '1rem' }}>
                      <p className="title is-4">Room {room.room_number}</p>
                      <p className="subtitle is-6">{room.room_type_name}</p>
                      <p>Description: {room.room_description}</p>
                      <p>Max People: {room.room_pax_max}</p>
                      <p>Rate: ₱{room.room_rate}/night</p>
                      <p>
                        Final Rate: ₱{room.room_final_rate}/night{' '}
                        <span className="has-text-danger">{room.room_disc_percentage}% off</span>
                      </p>
                      <button className="button is-blue is-fullwidth" onClick={() => handleBookNow(room)}>
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default RoomWalkIn;
