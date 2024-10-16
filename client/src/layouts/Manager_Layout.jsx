import React from 'react';
import { useLocation } from 'react-router-dom';
import SidebarManager from './Slidebar_manager_1';
import Navbar_manager from './Navbar_manager';
import LandscapeWarning from './LandscapeWarning'; 

const ManagerLayout = ({ children }) => {
const location = useLocation();
const hideFooter = location.pathname === '/staff_login' || location.pathname === '/manager_home';

return (
    <React.Fragment>
      <LandscapeWarning /> 
      <div className="columns mt-6">
        <Navbar_manager />
        {!hideFooter && <div style={{ paddingTop: '3rem' }}> <SidebarManager /> </div>}
        <div className="column" style={{ backgroundColor: "#e5e5f2" }}>
          <main>{children}</main>
        </div>
      </div>
    </React.Fragment>
  );
};

export default ManagerLayout;
