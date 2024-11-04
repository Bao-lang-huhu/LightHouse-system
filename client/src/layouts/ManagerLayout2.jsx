import React from 'react';
import { useLocation } from 'react-router-dom';
import SidebarManager2 from './Slidebar_manager_2'
import Navbar_manager from './Navbar_manager';

const ManagerLayout2 = ({children}) => {
    const location = useLocation();
    const hideFooter = location.pathname === '/staff_login' || location.pathname === '/manager_home';
    
  return (
    <React.Fragment>
        <div className="columns mt-6">
            <Navbar_manager/>
            {!hideFooter && <div > <SidebarManager2/> </div>}
                <div className="column" style={{backgroundColor:"#e5e5f2"}}>
                    <main>{children}</main>
                </div>
        </div>

    </React.Fragment>
  )
}

export default ManagerLayout2;