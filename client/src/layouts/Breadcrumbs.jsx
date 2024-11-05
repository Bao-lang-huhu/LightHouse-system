import React from 'react';
import 'bulma/css/bulma.min.css';
import './layouts.css';
import '../App.css';
import { Link, useNavigate } from 'react-router-dom';


const Breadcrumbs = ({ items }) => {
  const navigate = useNavigate();

  return (
      <nav className="breadcrumb" aria-label="breadcrumbs">
          <ul>
              {items.map((item, index) => (
                  <li key={index} className={index === items.length - 1 ? "is-active" : ""}>
                      {item.action ? (
                          <a onClick={item.action}>{item.label}</a> // Use action if available
                      ) : item.link ? (
                          <Link to={item.link}>{item.label}</Link>
                      ) : (
                          <span>{item.label}</span>
                      )}
                  </li>
              ))}
          </ul>
      </nav>
  );
};

export default Breadcrumbs;


