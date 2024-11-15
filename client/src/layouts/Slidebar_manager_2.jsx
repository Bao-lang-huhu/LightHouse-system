import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IoHome, IoPerson, IoChevronBack, IoChevronForward, IoBed, IoFastFood, IoCloud, IoCash } from 'react-icons/io5';
import 'bulma/css/bulma.min.css';
import './layouts.css';
import '../App.css';

const SidebarManager2 = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <section className='section-p1 side-color ' style={{
      transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-20%)',
      transition: 'transform 0.5s ease-in',
    }}>
      <div className="columns" style={{padding: "1em"}}>
        {/* Sidebar */}
        <aside className='aside-space' style={{ transition: 'width 0.3s', position: 'relative' }}>
          {/* Floating Toggle Button */}
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

          <nav className="menu" style={{ marginTop: isSidebarOpen ? '20px' : '70px' }}>
            {/* Menu List */}
            <p className="subtitle" style={{ display: isSidebarOpen ? 'block' : 'none', paddingTop: '50px' }}>
              Manager</p>
            
            <p className="menu-label" style={{ display: isSidebarOpen ? 'block' : 'none' }}>
              General
            </p>
            <ul className="menu-list">
                <li>
                    <Link 
                      to="/manager_home" 
                      title="Manager Home"
                      className={location.pathname === '/manager_home' ? 'is-right-active' : ''}
                    >
                    <IoHome style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                    {isSidebarOpen && 'Home'}
                    </Link>
                </li>
                <li>
                    <Link 
                      to="/manager_dashboard_reports" 
                      title="Manager Data Dashboard"
                      className={location.pathname === '/manager_dashboard_reports' ? 'is-right-active' : ''}
                    >
                    <IoPerson style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                    {isSidebarOpen && 'Dashboard'}
                    </Link>
                </li>
            </ul>

            <p className="menu-label" style={{ display: isSidebarOpen ? 'block' : 'none' }}>
              Reports
            </p>
            <ul className="menu-list">
                <li>
                    <Link 
                      to="/manager_report_sales" 
                      title="Sales"
                      className={location.pathname === '/manager_report_sales' ? 'is-right-active' : ''}
                    >
                    <IoCash style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                    {isSidebarOpen && 'Sales'}
                    </Link>
                </li>
                <li>
                    <Link 
                      to="/manager_report_menu_optimization" 
                      title="Orders Report"
                      className={location.pathname === '/manager_report_menu_optimization' ? 'is-right-active' : ''}
                    >
                    <IoFastFood style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                    {isSidebarOpen && 'Orders Report'}
                    </Link>
                </li>
                <li>
                    <Link 
                      to="/manager_report_forecasting" 
                      title="Forecast"
                      className={location.pathname === '/manager_report_forecasting' ? 'is-right-active' : ''}
                    >
                    <IoCloud style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                    {isSidebarOpen && 'Forecast'}
                    </Link>
                </li>
            </ul>
          </nav>
        </aside>
      </div>
    </section>
  );
};

export default SidebarManager2;
