import React, { useState } from 'react';
import 'bulma/css/bulma.min.css';
import './pages.css';
import '../App.css';
import Breadcrumbs from '../layouts/Breadcrumbs';
import ReservationsRoom from './ReservationsRoom';
import ReservationsTable from './ReservationsTable';
import ReservationsEvent from './ReservationsEvent';

const Reservations = () => {
    const breadcrumbItems = [
        { label: 'Home', link: '/' },
        { label: 'Reservations' },
    ];

    // State to manage the active tab
    const [activeTab, setActiveTab] = useState('room');

    const renderActiveSection = () => {
        switch (activeTab) {
            case 'room':
                return <ReservationsRoom />;
            case 'table':
                return <ReservationsTable />;
            case 'event':
                return <ReservationsEvent />;
            default:
                return <ReservationsRoom />;
        }
    };

    return (
        <section className="section-m1">
            <div className="contact-hero-image">
                <div className="text-content-title">
                    <h1 className="title">Reservations</h1>
                    <h3 className="subtitle">Manage your reservations.</h3>
                </div>
            </div>

            <div>
                <Breadcrumbs items={breadcrumbItems} />
            </div>

          
            <div className="m-2">
  {/* Tab navigation */}
  <div className="tabs is-toggle is-fullwidth">
    <ul className="is-flex-direction-column-mobile">
      {/* Room Reservation */}
      <li className={activeTab === 'room' ? 'is-active-blue' : ''}>
        <a onClick={() => setActiveTab('room')}>
          <span>Room Reservation</span>
        </a>
      </li>

      {/* Table Reservation */}
      <li className={activeTab === 'table' ? 'is-active-blue' : ''}>
        <a onClick={() => setActiveTab('table')}>
          <span>Table Reservation</span>
        </a>
      </li>

      {/* Event Reservation */}
      <li className={activeTab === 'event' ? 'is-active-blue' : ''}>
        <a onClick={() => setActiveTab('event')}>
          <span>Event Reservation</span>
        </a>
      </li>
    </ul>
  </div>

  {/* Container for the tab content */}
  <div className="box" style={{ backgroundColor: "#0077B7" }}>
    {renderActiveSection()}
  </div>
</div>






     
         

        </section>
    );
};

export default Reservations;
