import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  IoHome,
  IoPerson,
  IoChevronBack,
  IoChevronForward,
  IoPeople,
  IoBed,
  IoFastFood,
  IoWalk,
  IoBag,
  IoWine,
  IoLocate,
} from 'react-icons/io5';
import 'bulma/css/bulma.min.css';
import './layouts.css';
import '../App.css';

const SidebarManager3 = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);


  useEffect(() => {
    const handleResize = () => {
      const isMobileTablet =
        window.innerWidth <= 1024; 
      setIsMobileOrTablet(isMobileTablet);
      if (isMobileTablet) {
        setSidebarOpen(true); 
      }
    };

    handleResize(); 
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (!isMobileOrTablet) {
      setSidebarOpen(!isSidebarOpen);
    }
  };

  return (
    <section className='section-p1 side-color' style={{
      transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-20%)',
      transition: 'transform 0.5s ease-in', 
    }}>
      <div className='columns'>
        {/* Sidebar */}
        <aside
          className='aside-space'
          style={{ transition: 'width 0.3s', position: 'relative' }}
        >
          {/* Floating Toggle Button */}
          {!isMobileOrTablet && (
            <button
              className={`button button-float button-aside ${
                isSidebarOpen ? 'hide-toggle' : ''
              }`}
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
                boxShadow: '2px 2px 0px blue'
              }}
            >
              {isSidebarOpen ? <IoChevronBack /> : <IoChevronForward/>}
            </button>
          )}

          <nav className='menu'>
            {/* Menu List */}
            <p
              className='subtitle'
              style={{ display: isSidebarOpen ? 'block' : 'none', paddingTop: '50px' }}
            >
              Archives
            </p>

            <p className='menu-label' style={{ display: isSidebarOpen ? 'block' : 'none' }}>
              General
            </p>
            <ul className='menu-list'>
              <li>
                <Link to='/manager_home' title='Manager Home'>
                  <IoHome style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Home'}
                </Link>
              </li>
              <li>
                <Link to="/manager_archive_dashboard" title='Manager Archive Dashboard'>
                  <IoPerson style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Dashboard'}
                </Link>
              </li>
            </ul>

            <p className='menu-label' style={{ display: isSidebarOpen ? 'block' : 'none' }}>
              Accounts
            </p>
            <ul className='menu-list'>
              <li>
                <Link to='/manager_archive_accounts' title="Staff Accounts">
                  <IoPeople style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Staff Accounts'}
                </Link>
              </li>
            </ul>

            <p className='menu-label' style={{ display: isSidebarOpen ? 'block' : 'none' }}>
              Room Maintenance
            </p>
            <ul className='menu-list'>
              <li>
                <Link to='/manager_archive_rooms' title="Rooms">
                  <IoBed style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Rooms'}
                </Link>
              </li>
            </ul>
            

            <p className='menu-label' style={{ display: isSidebarOpen ? 'block' : 'none' }}>
              Menu Maintenance
            </p>
            <ul className='menu-list'>
              <li>
                <Link to='/manager_archive_foods' title="Food Menu">
                  <IoFastFood style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Food Menu'}
                </Link>
              </li>
              <li>
                <Link to='/manager_archive_drinks' title="Drink Menu">
                  <IoWine style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Drink Menu'}
                </Link>
              </li>
            </ul>

            <p className='menu-label' style={{ display: isSidebarOpen ? 'block' : 'none' }}>
              Additional Services Maintenance
            </p>
            <ul className='menu-list'>
              <li>
                <Link to='/manager_archive_concierges' title="Concierge">
                  <IoWalk style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Concierge'}
                </Link>
              </li>
              <li>
                <Link to='/manager_archive_laundry' title='Laundry'>
                  <IoBag style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Laundry'}
                </Link>
              </li>
            </ul>

            <p className='menu-label' style={{ display: isSidebarOpen ? 'block' : 'none' }}>
              Event Maintenance
            </p>
            <ul className='menu-list'>
              <li>
                <Link to='/manager_archive_venues' title='Venue Package'>
                  <IoLocate style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Venue Package'}
                </Link>
              </li>
              <li>
                <Link to="/manager_archive_packages" title='Food Package'>
                  <IoFastFood style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Food Package'}
                </Link>
              </li>
            </ul>
          </nav>
        </aside>
      </div>
    </section>
  );
};

export default SidebarManager3;
