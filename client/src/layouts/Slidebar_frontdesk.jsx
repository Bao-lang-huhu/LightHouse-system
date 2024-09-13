import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IoHome, IoPerson, IoChevronBack, IoChevronForward,  IoBed,  IoWalk,  IoWine, IoCheckmarkCircle, IoHappy, IoAddCircle, IoStar } from 'react-icons/io5';
import 'bulma/css/bulma.min.css';
import './layouts.css';
import '../App.css';

const SidebarFrontDesk= () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <section className='section-p1 side-color'>
      <div className="columns" >
        {/* Sidebar */}
        <aside className='aside-space' style={{ transition: 'width 0.3s', position: 'relative' }}>
          {/* Floating Toggle Button */}
          <button 
            className={`button is-blue button-float button-aside ${isSidebarOpen ? 'hide-toggle' : ''}`}
            onClick={toggleSidebar}
            style={{
              position: 'absolute',
              top: '10px',
              right: '-20px',
              width: '40px',
              height: '40px',
              textAlign: 'center',
              transition: 'right 0.3s',
              zIndex: '1',
            }}
          >
            {isSidebarOpen ? <IoChevronBack /> : <IoChevronForward />}
          </button>

          <nav className="menu">
            {/* Menu List */}
            <p className="subtitle" style={{ display: isSidebarOpen ? 'block' : 'none', paddingTop: '50px' }}>
              Fronk Desk</p>
            
            <p className="menu-label" style={{ display: isSidebarOpen ? 'block' : 'none' }}>
              General
            </p>
            <ul className="menu-list">
              <li>
                <Link to="/frontdesk_home">
                  <IoHome style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Home'}
                </Link>
              </li>
              <li>
                <a>
                  <IoPerson style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Dashboard'}
                </a>
              </li>
            </ul>

            <p className="menu-label" style={{ display: isSidebarOpen ? 'block' : 'none' }}>
              Walk-In Reservation
            </p>
            <ul className="menu-list">
              <li>
                <Link to="/frontdesk_room_walk_in">
                  <IoBed style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Walk-In Room Reservation'}
                </Link>
              </li>
              <li>
                <Link to="/frontdesk_event_walk_in">
                  <IoWine style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Walk-In Event Reservation'}
                </Link>
              </li>
            </ul>

            <p className="menu-label" style={{ display: isSidebarOpen ? 'block' : 'none' }}>
              Reservations
            </p>
            <ul className="menu-list">
              <li>
                <Link to="/frontdesk_room_reservation">
                  <IoBed style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Rooms'}
                </Link>
              </li>
              <li>
                <a>
                  <IoWine style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Events'}
                </a>
              </li>
            </ul>

            <p className="menu-label" style={{ display: isSidebarOpen ? 'block' : 'none' }}>
              Checked-In
            </p>
            <ul className="menu-list">
              <li>
                <a>
                  <IoCheckmarkCircle style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Check-In Guest'}
                </a>
              </li>
              <li>
                <a>
                  <IoHappy style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Checked-Out History'}
                </a>
              </li>
            </ul>

            <p className="menu-label" style={{ display: isSidebarOpen ? 'block' : 'none' }}>
              In-Room Services
            </p>
            <ul className="menu-list">
              <li>
                <Link to="/frontdesk_concierge_and_laundry">
                  <IoWalk style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Concierge & Laundry'}
                </Link>
              </li>
              <li>
                <Link to="/frontdesk_additional_item">
                  <IoAddCircle style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Additional Services'}
                </Link>
              </li>
            </ul>

            <p className="menu-label" style={{ display: isSidebarOpen ? 'block' : 'none' }}>
              Room Management
            </p>
            <ul className="menu-list">
              <li>
                <Link to ="/frontdesk_maintenance_and_housekeeping">
                  <IoStar style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Maintenance & Housekeeping'}
                </Link>
              </li>
            </ul>
          </nav>
        </aside>
      </div>
    </section>
  );
};

export default SidebarFrontDesk;