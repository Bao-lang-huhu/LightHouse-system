import React from 'react';
import { useLocation } from 'react-router-dom';
import SidebarManager3 from './Slidebar_manager_3';
import Navbar_manager from './Navbar_manager';

const ManagerLayout3 = ({children}) => {
    const location = useLocation();
    const hideFooter = location.pathname === '/staff_login' || location.pathname === '/manager_home';
    
  return (
    <React.Fragment>
        <div className="columns mt-6">
            <Navbar_manager/>
            {!hideFooter && <div style={{ paddingTop: '3rem' }}> <SidebarManager3/> </div>}
                <div className="column" style={{backgroundColor:"#e5e5f2"}}>
                    <main>{children}</main>
                </div>
        </div>

    </React.Fragment>
  )
}

export default ManagerLayout3;