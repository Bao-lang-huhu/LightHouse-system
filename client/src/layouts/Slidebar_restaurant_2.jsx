import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IoHome, IoPerson, IoChevronBack, IoChevronForward, IoGridOutline, IoMailOpenOutline } from 'react-icons/io5';
import 'bulma/css/bulma.min.css';
import './layouts.css';
import '../App.css';

const SidebarRestaurant_2 = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  const location = useLocation(); // Get current path

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
      <div className='columns'  style={{padding: "1em"}}>
        <aside className='aside-space' style={{ transition: 'width 0.3s', position: 'relative' }}>
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

          <nav className='menu'  style={{ marginTop: isSidebarOpen ? '20px' : '70px' }}>
            <p className='subtitle' style={{ display: isSidebarOpen ? 'block' : 'none', paddingTop: '50px' }}> Restaurant Desk </p>

            <p className='menu-label' style={{ display: isSidebarOpen ? 'block' : 'none' }}> General</p>
            <ul className='menu-list'>
              <li>
                <Link 
                  to='/restaurant_home' 
                  title="Restaurant Home"
                  className={location.pathname === '/restaurant_home' ? 'is-right-active' : ''}
                >
                  <IoHome style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Home'}
                </Link>
              </li>
              <li>
                <Link 
                  to="/restaurant_dashboard_table" 
                  title='Restaurant Dashboard'
                  className={location.pathname === '/restaurant_dashboard_table' ? 'is-right-active' : ''}
                >
                  <IoPerson style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Dashboard'}
                </Link>
              </li>
            </ul>

            <p className='menu-label' style={{ display: isSidebarOpen ? 'block' : 'none' }}> Tables </p>
            <ul className='menu-list'>
              <li>
                <Link 
                  to="/restaurant_table_maintenance" 
                  title='Table Maintenance'
                  className={location.pathname === '/restaurant_table_maintenance' ? 'is-right-active' : ''}
                >
                  <IoGridOutline style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Table Maintenance'}
                </Link>
              </li>
              <li>
                <Link 
                  to="/restaurant_table_reservations" 
                  title='Table Reservations'
                  className={location.pathname === '/restaurant_table_reservations' ? 'is-right-active' : ''}
                >
                  <IoMailOpenOutline style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Table Reservations'}
                </Link>
              </li>
            </ul>
          </nav>
        </aside>
      </div>
    </section>
  );
};

export default SidebarRestaurant_2;
