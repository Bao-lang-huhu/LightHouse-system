import React, { useState } from 'react';
import 'bulma/css/bulma.min.css';
import './components_f.css';
import '../App.css';
import EventReservationCalendar from './Event_Reservation_Calendar';
const EventReservation = () => {
  return (
    <section className='section-p1'> 
      <header>
        <div style={{ backgroundColor: 'white', borderRadius: '10px 10px' }}>
          <div className='column'>
            <h1 className='subtitle'>
              <strong>Event Reservations</strong>
            </h1>
          </div>
        </div>
        <hr/>
      </header>
      <div>
        <EventReservationCalendar />
      </div>   
    </section>
  );
};

export default EventReservation;
