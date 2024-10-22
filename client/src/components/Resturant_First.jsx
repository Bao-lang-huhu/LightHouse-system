import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import './pages.css';
import '../App.css';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Breadcrumbs from '../layouts/Breadcrumbs';
import axios from 'axios';

import bar from '../images/guest_home/restaurant.jpg';
import al from '../images/guest_home/garden.jpg';

function Resturant_First() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [availableSeatQuantities, setAvailableSeatQuantities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState('');
  const navigate = useNavigate();

  const getTomorrowDate = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow;
  };

  useEffect(() => {
    const fetchSeatQuantities = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/getTables');
        const uniqueSeatQuantities = [...new Set(response.data.map(table => table.seat_quantity))];
        setAvailableSeatQuantities(uniqueSeatQuantities);
      } catch (error) {
        console.error('Error fetching seat quantities:', error);
      }
    };

    fetchSeatQuantities();
  }, []);

  const tileDisabled = ({ date, view }) => {
    if (view === 'month') {
      return date.getDay() === 0 || date.getDay() === 6; // Disable weekends
    }
    return false;
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const images = [
    { src: bar, title: 'Restaurant Image' },
    { src: al, title: 'Garden Image' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); 

    return () => clearInterval(interval);
  }, [images.length]);

  const breadcrumbItems = [
    { label: 'Home', link: '/' },
    { label: 'Restaurant Date Reservation' }
  ];

  const handleCheckAvailability = async () => {
    if (!selectedDate || !selectedTime || !guestCount) {
      setAvailabilityMessage('Please select a date, time, and number of guests.');
      return;
    }
    setLoading(true);
    setAvailabilityMessage('');
  
    try {
      const adjustedDate = new Date(selectedDate);
      adjustedDate.setDate(adjustedDate.getDate() + 1 );
  
      const reservationDate = adjustedDate.toISOString().split('T')[0]; 
  
      localStorage.setItem('table_reservation_date', reservationDate);
      localStorage.setItem('table_reservation_time', selectedTime);
      localStorage.setItem('table_guest_quantity', guestCount);
  
      const response = await axios.get('http://localhost:3001/api/checkTablesAvailability', {
        params: {
          table_reservation_date: reservationDate,
          table_time: selectedTime,
          table_guest_quantity: guestCount,
        },
      });
  
      if (response.data.length > 0) {
        // Navigate to the next page with the available tables
        navigate('/resturant_tables', { state: { tables: response.data } });
      } else {
        setAvailabilityMessage('No tables available for the selected date, time, and guest count.');
      }
    } catch (error) {
      console.error('Error checking table availability:', error);
      setAvailabilityMessage('Error checking table availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <section className='section-m1'>
      <div>
        <div className="hero-body" style={{ backgroundImage: `url(${al})`, margin: '2%' }}>
          <div className="container has-text-centered" style={{ padding: '2%' }}>
            <h1 className="title has-text-white">Restaurant Table Reservation</h1>
          </div>
        </div>

        <div>
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <div className="container event-bg-style" style={{ marginBottom: '2%' }}>
          <div className="columns">
            <div className="column is-half">
              <div className="carousel">
                {images.map((image, index) => (
                  <div key={index} className="carousel-item">
                    <img
                      src={image.src}
                      alt={image.title}
                      className={index === currentIndex ? 'active' : ''}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="column is-half event-style">
              <div className='column'>
                <p className="subtitle has-text-centered">Restaurant Table Booking Date</p>
                <div className="field field-style">
                  <label className="label">Table Reservation Details:</label>
                  <div className="control">
                    <Calendar
                      onChange={setSelectedDate}
                      tileDisabled={tileDisabled}
                      minDate={getTomorrowDate()} 
                      value={selectedDate}
                      className="calendar"
                    />
                  </div>
                  {selectedDate ? (
                    <p className="has-text-grey">Selected Date: {selectedDate.toDateString()}</p>
                  ) : (
                    <p className="has-text-danger">Please select a date.</p>
                  )}
                </div>

                <div className="field">
                  <label className="label">Select Time:</label>

                  <div className="control">
                    <p className="subtitle">Morning</p>
                    <div className="buttons">
                      {['9:00', '10:00', '11:00'].map((time) => (
                        <button
                          key={time}
                          className={`button is-blue time-slot-button ${selectedTime === time ? 'is-selected' : ''}`}
                          onClick={() => setSelectedTime(time)}
                        >
                          {time} AM
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Afternoon Time Slots */}
                  <div className="control mt-3">
                    <p className="subtitle">Afternoon</p>
                    <div className="buttons">
                      {['2:00', '3:00', '4:00', '5:00'].map((time) => (
                        <button
                          key={time}
                          className={`button is-blue time-slot-button ${selectedTime === time ? 'is-selected' : ''}`}
                          onClick={() => setSelectedTime(time)}
                        >
                          {time} PM
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Error message if no time is selected */}
                  {!selectedTime && <p className="has-text-danger">Please select a time.</p>}
                </div>


                <div className="field">
                  <label className="label">Number of Guests:</label>
                  <p className="m-1 has-text-grey is-size-7">
                    Choose a table with a seating capacity that fits within the available options.
                  </p>
                  <div className="control">
                    <div className="select is-fullwidth">
                      <select
                        value={guestCount}
                        onChange={(e) => setGuestCount(e.target.value)}
                      >
                        <option value="" disabled>Select number of guests</option>
                        {availableSeatQuantities.map(seatQty => (
                          <option key={seatQty} value={seatQty}>
                            {seatQty === 8 ? 'Large groups (8 or more guests)' : `${seatQty} Guests`}
                          </option>
                        ))}
                      </select>
                    </div>
                    {!guestCount && (
                      <p className="has-text-danger">Please select number of guests.</p>
                    )}
                  </div>
                </div>


              </div>

              <div className="buttons is-centered">
                <button
                  className={`button is-blue search-reservation ${loading ? 'is-loading' : ''}`}
                  type="submit"
                  onClick={handleCheckAvailability}
                  disabled={loading || !selectedDate || !selectedTime || !guestCount}
                >
                  {loading ? 'Checking...' : 'SELECT FOR BOOKING DATE'}
                </button>
              </div>

              {availabilityMessage && (
                <div className="notification is-warning has-text-centered">
                  {availabilityMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Resturant_First;
