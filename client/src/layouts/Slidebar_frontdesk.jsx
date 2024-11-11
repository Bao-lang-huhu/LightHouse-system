import React, { useState , useEffect} from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IoHome, IoPerson, IoChevronBack, IoChevronForward, IoBed, IoWalk, IoWine, IoCheckmarkCircle, IoHappy, IoAddCircle, IoStar } from 'react-icons/io5';
import 'bulma/css/bulma.min.css';
import './layouts.css';
import '../App.css';

const SidebarFrontDesk = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation(); // Get current path
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  const toggleSidebar = () => {
    if (!isMobileOrTablet) {
      setSidebarOpen(!isSidebarOpen);
    }
  };

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


  return (
    <section className='section-p1 side-color' style={{
      transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-20%)',
      transition: 'transform 0.5s ease-in', 
    }}>
      <div className="columns" style={{padding: "1em"}}>
        {/* Sidebar */}
        <aside className='aside-space' style={{ transition: 'width 0.3s', position: 'relative' }}>
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

          <nav className="menu" style={{ marginTop: isSidebarOpen ? '20px' : '70px' }}>
            <p className="subtitle" style={{ display: isSidebarOpen ? 'block' : 'none', paddingTop: '50px' }}>
              Front Desk
            </p>

            <p className="menu-label" style={{ display: isSidebarOpen ? 'block' : 'none' }}>General</p>
            <ul className="menu-list">
              <li>
                <Link 
                  to="/frontdesk_home" 
                  title="Front Desk Home"
                  className={location.pathname === '/frontdesk_home' ? 'is-right-active' : ''}
                >
                  <IoHome style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Home'}
                </Link>
              </li>
              <li>
                <Link 
                  to="/frontdesk_dashboard" 
                  className={location.pathname === '/frontdesk_dashboard' ? 'is-right-active' : ''}
                >
                  <IoPerson style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Dashboard'}
                </Link>
              </li>
            </ul>

            <p className="menu-label" style={{ display: isSidebarOpen ? 'block' : 'none' }}>Walk-In Reservation</p>
            <ul className="menu-list">
              <li>
                <Link 
                  to="/frontdesk_room_walk_in" 
                  title='Walk-In Room Reservation'
                  className={location.pathname === '/frontdesk_room_walk_in' ? 'is-right-active' : ''}
                >
                  <IoBed style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Walk-In Room Reservation'}
                </Link>
              </li>
              <li>
                <Link 
                  to="/frontdesk_event_walk_in" 
                  title="Walk-In Event Reservation"
                  className={location.pathname === '/frontdesk_event_walk_in' ? 'is-right-active' : ''}
                >
                  <IoWine style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Walk-In Event Reservation'}
                </Link>
              </li>
            </ul>

            <p className="menu-label" style={{ display: isSidebarOpen ? 'block' : 'none' }}>Reservations</p>
            <ul className="menu-list">
              <li>
                <Link 
                  to="/frontdesk_room_reservation" 
                  title='Rooms'
                  className={location.pathname === '/frontdesk_room_reservation' ? 'is-right-active' : ''}
                >
                  <IoBed style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Rooms'}
                </Link>
              </li>
              <li>
                <Link 
                  to="/frontdesk_event_reservation" 
                  title="Events"
                  className={location.pathname === '/frontdesk_event_reservation' ? 'is-right-active' : ''}
                >
                  <IoWine style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Events'}
                </Link>
              </li>
            </ul>

            <p className="menu-label" style={{ display: isSidebarOpen ? 'block' : 'none' }}>Checked-In</p>
            <ul className="menu-list">
              <li>
                <Link 
                  to="/frontdesk_check_in" 
                  title="Check-In Guest"
                  className={location.pathname === '/frontdesk_check_in' ? 'is-right-active' : ''}
                >
                  <IoCheckmarkCircle style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Check-In Guest'}
                </Link>
              </li>
              <li>
                <Link 
                  to="/frontdesk_check_out" 
                  title="Checked-Out History"
                  className={location.pathname === '/frontdesk_check_out' ? 'is-right-active' : ''}
                >
                  <IoHappy style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Checked-Out History'}
                </Link>
              </li>
            </ul>

            <p className="menu-label" style={{ display: isSidebarOpen ? 'block' : 'none' }}>In-Room Services</p>
            <ul className="menu-list">
              <li>
                <Link 
                  to="/frontdesk_concierge_and_laundry" 
                  title='Concierge & Laundry'
                  className={location.pathname === '/frontdesk_concierge_and_laundry' ? 'is-right-active' : ''}
                >
                  <IoWalk style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Concierge & Laundry'}
                </Link>
              </li>
              <li>
                <Link 
                  to="/frontdesk_additional_item" 
                  title='Additional Services'
                  className={location.pathname === '/frontdesk_additional_item' ? 'is-right-active' : ''}
                >
                  <IoAddCircle style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                  {isSidebarOpen && 'Additional Services'}
                </Link>
              </li>
            </ul>

            <p className="menu-label" style={{ display: isSidebarOpen ? 'block' : 'none' }}>Room Management</p>
            <ul className="menu-list">
              <li>
                <Link 
                  to="/frontdesk_maintenance_and_housekeeping" 
                  title='Maintenance & Housekeeping'
                  className={location.pathname === '/frontdesk_maintenance_and_housekeeping' ? 'is-right-active' : ''}
                >
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
