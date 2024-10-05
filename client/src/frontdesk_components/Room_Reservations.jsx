import React, { useState } from 'react';
import 'bulma/css/bulma.min.css';
import './components_f.css';
import '../App.css';
import RoomReservationCalendar from './Room_Reservation_Calendar.jsx';

const RoomReservation = () => {
  return (
    <section className='section-p1'> 
      <header>
        <div style={{ backgroundColor: 'white', borderRadius: '10px 10px' }}>
          <div className='column'>
            <h1 className='subtitle'>
              <strong>Room Reservations</strong>
            </h1>
          </div>
        </div>
        <hr/>
      </header>
      <div>
        <RoomReservationCalendar />
      </div>   
    </section>
  );
};

export default RoomReservation;
