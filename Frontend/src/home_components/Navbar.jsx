import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faUser, faBars, faXmark} from "@fortawesome/free-solid-svg-icons";
import {Link, NavLink} from 'react-router-dom';
import './Navbar.css';


const Navbar = () => {

  const [isVerticalNavbarOpen, setVerticalNavbarOpen] = useState(false);

  const verBar = () => {
    setVerticalNavbarOpen(!isVerticalNavbarOpen);
  };

  return (
    <>
      <nav>
        <div className="left-section">
            <Link to="/">
              <img src="pic/logo.png" alt="Logo" className="logo" />
            </Link>
        </div>

        <div className="right-section">
          <div>
            <NavLink to="/Profile">
              <FontAwesomeIcon icon={faUser} className="profile-icon" />
            </NavLink>
          </div>
          <div className="menu" onClick={verBar}>
            {isVerticalNavbarOpen ? (
              <FontAwesomeIcon icon={faXmark} beat id="simbol" />
            ) : (
              <FontAwesomeIcon icon={faBars} spin id="simbol" />
            )}
          </div>

          {isVerticalNavbarOpen && (
            <ul className="vertical-navbar">
              <li>
                <NavLink to="/Canali">Canali</NavLink>
              </li>
              <li>
                <NavLink to="/Assistenza">Assistenza</NavLink>
              </li>
              <li>
                <NavLink to="/Shop">Shop</NavLink>
              </li>
            </ul>
          )}
        </div>

      </nav>
    </>


  );
};

export default Navbar;





