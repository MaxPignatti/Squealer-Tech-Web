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
        <Link to="/"><img src="pic/logo.png" alt="Logo" className="logo" /></Link>
        <div>
          <ul id="navbar" className= {isVerticalNavbarOpen ? "open" : ""}>
            <li> <NavLink to="/Profile"><FontAwesomeIcon icon={faUser} /></NavLink> </li>
            <li> <NavLink to="">Canali</NavLink> </li>
            <li> <NavLink to="">Shop</NavLink> </li>
            <li> <NavLink to="">Assistenza</NavLink> </li>
          </ul>

        </div>

        <div className = "menu" onClick={verBar}>
        {isVerticalNavbarOpen ? (
          <FontAwesomeIcon icon={faXmark} beat id = "simbol"/> ) : (
          <FontAwesomeIcon icon={faBars} spin  id = "simbol"/>
        )}
        </div>

      </nav>
    </>


  );
};

export default Navbar;





