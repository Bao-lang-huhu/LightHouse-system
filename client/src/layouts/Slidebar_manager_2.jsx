import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IoHome, IoPerson, IoChevronBack, IoChevronForward, IoBed, IoFastFood, IoCloud, IoCash } from 'react-icons/io5';
import 'bulma/css/bulma.min.css';
import './layouts.css';
import '../App.css';

const SidebarManager2 = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <section className='section-p1 side-color' style={{
      transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-20%)',
      transition: 'transform 0.5s ease-in', 
    }}>
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
              Manager</p>
            
            <p className="menu-label" style={{ display: isSidebarOpen ? 'block' : 'none' }}>
              General
            </p>
            <ul className="menu-list">
                <li>
                    <Link to="/manager_home" title='Manager Home'>
                    <IoHome style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                    {isSidebarOpen && 'Home'}
                    </Link>
                </li>
                <li>
                    <Link to="/manager_dashboard_reports" title='Manager Data Dashboard'>
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
                    <Link to="/manager_report_sales" title="Sales">
                    <IoCash style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                    {isSidebarOpen && 'Sales'}
                    </Link>
                </li>

                <li>
                    <Link to="/manager_report_menu_optimization" title="Menu Optimization">
                    <IoFastFood style={{ marginRight: isSidebarOpen ? '5px' : '0', textAlign: 'center' }} />
                    {isSidebarOpen && 'Menu Optimization'}
                    </Link>
                </li>

                <li>
                    <Link to="/manager_report_forecasting" title="Forecast">
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
