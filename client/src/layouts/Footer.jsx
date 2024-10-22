import React from 'react';
import logo from "../images/guest_home/logo-new.png";
import { Link } from 'react-router-dom';
import '../App.css';
import { FaFacebook, FaInstagram} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-col">
        <Link to = "/" ><img src={logo} alt="LightHouse Point Hotel"  /></Link>
          <p><strong>Address:</strong>Airport Highway, Brgy. 40a Hibbard Ave, Dumaguete City, 6200 Negros Oriental</p>
          <p><strong>Phone:</strong> +63 912 2345 342 / +63 955 1850 136</p>
          <p><strong>Email:</strong> lighthousepoint@gmail.com</p>
          <p><strong>Check-in:</strong> 2 p.m.</p>
          <p><strong>Check-out:</strong> 12 p.m.</p>
        </div>

        <div className="footer-col">
          <h4>Know Us More</h4>
          <Link to = "/about_us" className="footer-link">About Us</Link>
          <Link to="/contact_us" className="footer-link">Contact Us</Link>
          <Link to="/faq" className="footer-link">Frequently Asked Questions</Link>
          <Link to="/terms_and_conditions" className="footer-link">Terms & Conditions</Link>
          <Link to="/cancel_policy" className="footer-link">Cancellation Policy</Link>
          <Link to="/website_data_policy" className="footer-link">Website Data Policy</Link>
        </div>

        <div className="footer-col">
          <h4>Follow Us</h4>
          <a href="https://www.facebook.com/LighthousePointHotelDumaguete" className="footer-link"><FaFacebook /> Facebook</a>
          <a href="https://l.messenger.com/l.php?u=https%3A%2F%2Fwww.instagram.com%2Flighthousepoint_dgte%2F&h=AT072NRmLc9VkFhSXsJEVI1hdeEXJM2eBq2h3VA0hRF98L8Ez3kdjELILP9FP_M90d8wls6BO6R6AnVgOGWbqw55835kEHibA32DwnmJRbuXwlP6Z_1hwyS0hMR4C8P_MzMidw" className="footer-link"><FaInstagram /> Instagram</a>
        </div>
      </div>
      <div className="footer-copyright">
        <p>©2024,LightHouse Point Hotel - Dumaguete City Negros Oriental</p>
      </div>
    </footer>
  );
};

export default Footer;
