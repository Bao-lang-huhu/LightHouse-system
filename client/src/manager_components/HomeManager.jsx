import React, { useState, useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import logo from '../images/logo.png';
import '../App.css';
import './components_m.css';
import { Link } from 'react-router-dom';
import { IoGridSharp, IoSettings, IoSave } from 'react-icons/io5';
import {jwtDecode} from 'jwt-decode'; // Import jwtDecode

const HomeManager = () => {
  const [staffUsername, setStaffUsername] = useState('Manager'); // State to store the staff username

  useEffect(() => {
    // Retrieve the token from localStorage
    const token = localStorage.getItem('token');

    if (token) {
      try {
        // Decode the token and extract staff_username
        const decodedToken = jwtDecode(token);
        const username = decodedToken.staff_username;
        setStaffUsername(username); // Set the staff username
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  return (
    <section>
      <div className="home-page hero is-color home-page">
        <div className="hero-body">
          <div className="container has-text-centered">
            {/* Logo */}
            <figure className="is-192x192 is-inline-block">
              <img src={logo} alt="Logo" />
            </figure>

            {/* Welcome Phrase */}
            <h1 className="title">
              Welcome! {staffUsername}
            </h1>
            <h2 className="subtitle">
              Let’s Start.
            </h2>

            {/* Buttons */}
            <div className="buttons is-centered mt-4">
              <Link to="/manager_dashboard" className="button is-blue">
                <IoSettings style={{ textAlign: 'center', margin: '5px' }} /> Service Maintenance
              </Link>
              <Link to="/manager_dashboard_reports" className="button is-dark-blue">
                <IoGridSharp style={{ textAlign: 'center', margin: '5px' }} /> Service Reports
              </Link>
              <Link to="/manager_archive_dashboard" className="button is-inverted-blue">
                <IoSave style={{ textAlign: 'center', margin: '5px' }} /> Archives
              </Link>

            
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeManager;
