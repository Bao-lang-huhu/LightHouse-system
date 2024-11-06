import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import 'bulma/css/bulma.min.css';
import logo from "../images/logo.png";
import defaultProfilePic from '../images/guest_home/garden.jpg';
import './layouts.css';
import '../App.css';
import { IoLogOut } from 'react-icons/io5';
import Avatar from '@mui/material/Avatar';

function Navbar_manager() {
  const [isActive, setIsActive] = useState(false);
  const [staffPhoto, setStaffPhoto] = useState(defaultProfilePic);
  const navigate = useNavigate();
  const location = useLocation(); // Track the current route
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.staff_id) {
          fetchStaffDetails(decodedToken.staff_id);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, [token]);

  const fetchStaffDetails = async (staffId) => {
    try {
      const response = await axios.get(`https://light-house-system-h74t-server.vercel.app/api/getStaffDetails`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const staffDetails = response.data;
      setStaffPhoto(staffDetails.staff_photo || defaultProfilePic);
    } catch (error) {
      console.error('Error fetching staff details:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/staff_login');
  };

  return (
    <nav className="navbar is-white is-fixed-top has-shadow" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <Link to="/" className="navbar-item">
          <img src={logo} alt="LightHouse Point Hotel" className='navbar-logo' />
        </Link>
        <button
          className={`navbar-burger burger ${isActive ? 'is-active' : ''}`}
          aria-label="menu"
          aria-expanded={isActive ? 'true' : 'false'}
          onClick={() => setIsActive(!isActive)}
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </button>
      </div>

      <div id="navbarBasicExample" className={`navbar-menu ${isActive ? 'is-active' : ''}`}>
        <div className="navbar-end">
          <div className="navbar-item">
            <div className="buttons">
              {location.pathname !== '/staff_login' && ( // Hide profile on /staff_login page
                <>
                  <Link to="/manager_profile" className="button is-white">
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        backgroundImage: `url(${staffPhoto})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundColor: staffPhoto ? 'transparent' : '#1976d2',
                      }}
                    >
                      {!staffPhoto && <Avatar sx={{ width: '100%', height: '100%' }}>S</Avatar>}
                    </div>
                  </Link>
                  <button onClick={handleLogout} className="button is-blue">
                    <strong><IoLogOut className='icon-button-space' /> Log out</strong>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar_manager;
