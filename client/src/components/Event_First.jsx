import React, { useState, useEffect } from 'react';  
import 'bulma/css/bulma.min.css';
import './pages.css';
import '../App.css';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Breadcrumbs from '../layouts/Breadcrumbs';
import AddEventReservation from '../guest_modals/AddEventReservation';
import axios from 'axios';
import { IoWarning } from 'react-icons/io5';
import al from '../images/guest_home/pool.webp';

function Event_first() {
  const [selectedDate, setSelectedDate] = useState(null); // Initially no date selected
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false); // Conflict modal
  const [isButtonLoading, setIsButtonLoading] = useState(false); // Button loading state
  const [currentIndex, setCurrentIndex] = useState(0);

  const minReservationDate = new Date();
  minReservationDate.setDate(minReservationDate.getDate() + 5); // Set minimum date to 5 days from today

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const toggleConflictModal = () => {
    setIsConflictModalOpen(!isConflictModalOpen);
  };

  const tileDisabled = ({ date, view }) => {
    if (view === 'month') {
      return date.getDay() === 0 || date.getDay() === 6 || date < minReservationDate;
    }
    return false;
  };

  const images = [
    {
      src: al,
      title: 'Garden Image',
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [images.length]);

  const breadcrumbItems = [
    { label: 'Home', link: '/' },
    { label: 'Event Reservation' },
  ];


const checkDateConflict = async () => {
  if (!selectedDate) {
      alert("Please select a date before proceeding.");
      return;
  }

  setIsButtonLoading(true); // Set button to loading state

  try {
      // Convert selected date to local date string (YYYY-MM-DD) format
      const eventDate = selectedDate.toLocaleDateString('en-CA'); // 'en-CA' outputs the date as YYYY-MM-DD

      // Make the GET request with the event_date as a query parameter
      const response = await axios.get('http://localhost:3001/api/getEventReservations', {
          params: { event_date: eventDate }, // Send the date without time and in local format
      });

      setIsButtonLoading(false); 


      if (response.data.conflict) {
          setIsModalOpen(false); 
          setIsConflictModalOpen(true); 
      } else {
          localStorage.setItem('event_date', eventDate);  // Save selected date in localStorage
          setIsModalOpen(true);  // Open reservation modal if no conflict
          setIsConflictModalOpen(false);  // Ensure the conflict modal is closed
      }
  } catch (err) {
      console.error('Failed to check date conflict:', err);
      setIsButtonLoading(false); // Reset button loading state on error
  }
};


  return (
    <section className='section-m1'> 
        <div className="hero-body" style={{ backgroundImage: `url(${al})`, margin: '2%' }}>
            <div className="container has-text-centered" style={{ padding: '2%' }}>
              <h1 className="title has-text-white">Event Reservation</h1>
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
                <p className="subtitle has-text-centered">Event and Venue Booking Date</p>
                <div className="field field-style">
                  <label className="label">Event Reservation Date:</label>
                  <div className="control">
                    <Calendar
                      onChange={setSelectedDate}
                      tileDisabled={tileDisabled}
                      minDate={minReservationDate}
                      value={selectedDate}
                      className="calendar"
                    />
                  </div>
                  <p className="has-text-grey">Selected Date: {selectedDate ? selectedDate.toDateString() : "No date selected"}</p>
                </div>
                <p className="has-text-danger">* Events must be reserved at least 5 days in advance.</p> {/* Note about 5 days */}
              </div> 
              <div className="buttons is-centered">
                <button
                  className={`button is-blue search-reservation ${isButtonLoading ? 'is-loading' : ''}`} // Add loading state to button
                  type="submit"
                  onClick={checkDateConflict}
                  disabled={!selectedDate || isButtonLoading} // Disable if no date is selected or button is loading
                >
                  {isButtonLoading ? 'Checking...' : 'SELECT FOR BOOKING DATE'}
                </button>
              </div>
            </div>
          </div>
        </div>
     
      <AddEventReservation isOpen={isModalOpen} toggleModal={toggleModal} />

      
      {isConflictModalOpen && (
        <div className="modal is-active">
          <div className="modal-background" onClick={toggleConflictModal}></div>
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div className="box">
              <IoWarning size={64} style={{ color: '#0077B7', marginBottom: '1rem' }} />
              <h1 className="title is-size-5">Date Conflict</h1>
              <p>The selected date has already been reserved for another event. Please choose a different date.</p>
              <button className="button is-blue mt-4" onClick={toggleConflictModal}>Try Again</button>
            </div>
          </div>
        </div>
      )}
      
    </section>
  );
}

export default Event_first;
