import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios for API calls
import {jwtDecode} from 'jwt-decode'; // Import jwt-decode for decoding the token
import 'bulma/css/bulma.min.css';
import logo from "../images/logo.png";
import defaultProfilePic from '../images/guest_home/garden.jpg'; // Default profile image
import './layouts.css';
import '../App.css';

function Navbar() {
  const [isActive, setIsActive] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [guestPhoto, setGuestPhoto] = useState(defaultProfilePic); // State for guest photo
  const [isGuest, setIsGuest] = useState(false); // Check if the user is a guest
  const navigate = useNavigate();

  const token = localStorage.getItem('token'); // Get token from local storage

  // Toggle navbar in mobile view
  const toggleNavbar = () => {
    setIsActive(!isActive);
  };

  useEffect(() => {
    if (token) {
      try {
        // Decode the token to check for guest_id
        const decodedToken = jwtDecode(token);

        // Check if the decoded token has a guest_id field, this means the user is logged in as a guest
        if (decodedToken.guest_id) {
          setIsGuest(true); // Set guest state
          setIsLoggedIn(true); // Consider the user logged in only if guest_id exists
          localStorage.setItem('guest_id', decodedToken.guest_id); // Store guest_id in localStorage
        } else {
          setIsGuest(false);
          setIsLoggedIn(false); // Do not consider the user logged in if no guest_id is present
          localStorage.removeItem('guest_id'); // Ensure guest_id is removed if not a guest
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        setIsGuest(false);
        setIsLoggedIn(false);
        localStorage.removeItem('guest_id'); // Remove guest_id if decoding fails
      }
    } else {
      setIsLoggedIn(false);
      setIsGuest(false);
    }

    // Fetch guest details if the user is a guest
    const fetchGuestDetails = async () => {
      if (token && isGuest) {
        try {
          const response = await axios.get('https://light-house-system-h74t-server.vercel.app/api/getGuestDetails', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const guestDetails = response.data;
          if (guestDetails.guest_photo) {
            setGuestPhoto(guestDetails.guest_photo);
          }
        } catch (error) {
          console.error('Error fetching guest details:', error);
        }
      }
    };

    fetchGuestDetails();
  }, [token, isGuest]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('guest_id'); // Remove guest_id when logging out
    setIsLoggedIn(false);
    setIsGuest(false);
    navigate('/login');
  };

  return (
    <>
      <nav className="navbar is-white is-fixed-top has-shadow" role="navigation" aria-label="main navigation">
        <div className="navbar-brand">
          <Link to="/" className="navbar-item">
            <img src={logo} alt="LightHouse Point Hotel" className='navbar-logo' />
          </Link>
          <button
            className={`navbar-burger burger ${isActive ? 'is-active' : ''}`}
            aria-label="menu"
            aria-expanded={isActive ? 'true' : 'false'}
            onClick={toggleNavbar}
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </button>
        </div>

        <div id="navbarBasicExample" className="navbar-menu">
          <div className="navbar-start">
            <Link to="/" className="navbar-item">Home</Link>
            <Link to="/about_us" className="navbar-item">About Us</Link>
            <Link to="/contact_us" className="navbar-item">Contact Us</Link>
            <Link to="/resturant_filtering" className="navbar-item">Restaurant</Link>
            <Link to="/event_filtering" className="navbar-item">Events</Link>
            <Link to="/virtual_tour" className="navbar-item">Virtual Tour</Link>
          </div>

          <div className="navbar-end">
            {!isLoggedIn ? (
              <div className="navbar-item">
                <div className="buttons">
                  <Link to="/register" className="button is-blue"><strong>Sign-up</strong></Link>
                  <Link to="/login" className="button is-light"><strong>Log in</strong></Link>
                </div>
              </div>
            ) : isGuest ? (
              <div className="navbar-item has-dropdown is-hoverable">
                <a className="navbar-link">
                  <figure className="image is-32x32">
                    <img className="is-rounded" src={guestPhoto || defaultProfilePic} alt="Profile" />
                  </figure>
                </a>
                <div className="navbar-dropdown is-right">
                  <Link to="/profile_guest" className="navbar-item">Profile</Link>
                  <Link to="/reservations" className="navbar-item">Reservations</Link>
                  <button className="navbar-item button is-blue is-fullwidth" onClick={handleLogout}>
                    Log Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="navbar-item">
                {/* Additional options for non-guest users */}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Sidebar for mobile view */}
      <div id="sidebar" className={`sidebar ${isActive ? 'is-active' : ''}`}>
        <div className="sidebar-content">
          <button className="close-button" onClick={toggleNavbar} aria-label="Close sidebar">&times;</button>
          <Link to="/" className="sidebar-item">Home</Link>
          <Link to="/about_us" className="sidebar-item">About Us</Link>
          <Link to="/contact_us" className="sidebar-item">Contact Us</Link>
          <Link to="/resturant_filtering" className="sidebar-item">Restaurant</Link>
          <Link to="/event_filtering" className="sidebar-item">Events</Link>
          <Link to="/virtual_tour" className="sidebar-item">Virtual Tour</Link>

          <div className="navbar-end">
            {!isLoggedIn ? (
              <div className="sidebar-item">
                <div className="buttons">
                  <Link to="/register" className="button is-blue"><strong>Sign-up</strong></Link>
                  <Link to="/login" className="button is-light"><strong>Log in</strong></Link>
                </div>
              </div>
            ) : isGuest ? (
              <div>
                <figure className="image is-64x64 m-0">
                  <img className="is-rounded" src={guestPhoto || defaultProfilePic} alt="Profile" />
                </figure>
                <div className='sidebar-item'>
                  <Link to="/profile_guest" className="sidebar-item">Profile</Link>
                  <Link to="/reservations" className="sidebar-item">Reservations</Link>
                  <button className="sidebar-item button is-inverted-blue m-1" onClick={handleLogout}>
                    Log Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="sidebar-item">
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
