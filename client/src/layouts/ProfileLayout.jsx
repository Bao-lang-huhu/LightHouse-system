import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar_manager from './Navbar_manager';
import LandscapeWarning from './LandscapeWarning'; 

const ProfileLayout = ({ children }) => {
const location = useLocation();
const hideFooter = location.pathname === '/staff_login' || location.pathname === '/manager_home';

return (
    <React.Fragment>
      <LandscapeWarning /> 
      <div className="columns mt-6">
        <Navbar_manager />
        <div className="column" style={{ backgroundColor: "#e5e5f2" }}>
          <main>{children}</main>
        </div>
      </div>
    </React.Fragment>
  );
};

export default ProfileLayout;
