import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  const location = useLocation(); 

  useEffect(() => {
    const handleResize = () => {
      const isMobileTablet = window.innerWidth <= 1024; 
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
      <div className='columns' style={{padding: "1em"}}>
        <aside
          className='aside-space'
          style={{ transition: 'width 0.3s', position: 'relative' }}
        >
          {/* Floating Toggle Button */}
          {!isMobileOrTablet && (
             <div
             style={{
              position: 'absolute',
              top: isSidebarOpen ? '20px' : '10px', 
              left: isSidebarOpen ? 'auto' : '50%',
              transform: isSidebarOpen ? 'none' : 'translateX(-50%)',
              right: isSidebarOpen ? '-20px' : 'auto',
              zIndex: '1',
              transition: 'all 0.3s ease',
            }}>
            <button
              className="button is-blue button-float button-aside"
              onClick={toggleSidebar}
              style={{
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5em',  
              }}
            >
              <div style={{ transform: 'scale(1.5)', margin: "0" }}>  {/* Scale icon size */}
                {isSidebarOpen ? <IoChevronBack /> : <IoChevronForward />}
              </div>
            </button>
            </div>
          )}


          <nav className='menu' style={{ marginTop: isSidebarOpen ? '20px' : '70px' }}>
            <p className='subtitle' style={{ display: isSidebarOpen ? 'block' : 'none', paddingTop: '50px' }}>
              Archives
            </p>

            <p className='menu-label' style={{ display: isSidebarOpen ? 'block' : 'none' }}>General</p>
            <ul className='menu-list'>
              <li>
                <Link 
                  to='/manager_home' 
                  title='Manager Home'
                  className={location.pathname === '/manager_home' ? 'is-right-active' : ''}
                >
                  <IoHome style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Home'}
                </Link>
              </li>
              <li>
                <Link 
                  to="/manager_archive_dashboard" 
                  title='Manager Archive Dashboard'
                  className={location.pathname === '/manager_archive_dashboard' ? 'is-right-active' : ''}
                >
                  <IoPerson style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Dashboard'}
                </Link>
              </li>
            </ul>

            <p className='menu-label' style={{ display: isSidebarOpen ? 'block' : 'none' }}>Accounts</p>
            <ul className='menu-list'>
              <li>
                <Link 
                  to='/manager_archive_accounts' 
                  title="Staff Accounts"
                  className={location.pathname === '/manager_archive_accounts' ? 'is-right-active' : ''}
                >
                  <IoPeople style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Staff Accounts'}
                </Link>
              </li>
            </ul>

            <p className='menu-label' style={{ display: isSidebarOpen ? 'block' : 'none' }}>Room Maintenance</p>
            <ul className='menu-list'>
              <li>
                <Link 
                  to='/manager_archive_rooms' 
                  title="Rooms"
                  className={location.pathname === '/manager_archive_rooms' ? 'is-right-active' : ''}
                >
                  <IoBed style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Rooms'}
                </Link>
              </li>
            </ul>

            <p className='menu-label' style={{ display: isSidebarOpen ? 'block' : 'none' }}>Menu Maintenance</p>
            <ul className='menu-list'>
              <li>
                <Link 
                  to='/manager_archive_foods' 
                  title="Food Menu"
                  className={location.pathname === '/manager_archive_foods' ? 'is-right-active' : ''}
                >
                  <IoFastFood style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Food Menu'}
                </Link>
              </li>
              <li>
                <Link 
                  to='/manager_archive_drinks' 
                  title="Drink Menu"
                  className={location.pathname === '/manager_archive_drinks' ? 'is-right-active' : ''}
                >
                  <IoWine style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Drink Menu'}
                </Link>
              </li>
            </ul>

            <p className='menu-label' style={{ display: isSidebarOpen ? 'block' : 'none' }}>Additional Services Maintenance</p>
            <ul className='menu-list'>
              <li>
                <Link 
                  to='/manager_archive_concierges' 
                  title="Concierge"
                  className={location.pathname === '/manager_archive_concierges' ? 'is-right-active' : ''}
                >
                  <IoWalk style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Concierge'}
                </Link>
              </li>
              <li>
                <Link 
                  to='/manager_archive_laundry' 
                  title='Laundry'
                  className={location.pathname === '/manager_archive_laundry' ? 'is-right-active' : ''}
                >
                  <IoBag style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Laundry'}
                </Link>
              </li>
            </ul>

            <p className='menu-label' style={{ display: isSidebarOpen ? 'block' : 'none' }}>Event Maintenance</p>
            <ul className='menu-list'>
              <li>
                <Link 
                  to='/manager_archive_venues' 
                  title='Venue Package'
                  className={location.pathname === '/manager_archive_venues' ? 'is-right-active' : ''}
                >
                  <IoLocate style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Venue Package'}
                </Link>
              </li>
              <li>
                <Link 
                  to="/manager_archive_packages" 
                  title='Food Package'
                  className={location.pathname === '/manager_archive_packages' ? 'is-right-active' : ''}
                >
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
