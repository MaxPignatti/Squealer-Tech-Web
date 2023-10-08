import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faBars, faXmark} from "@fortawesome/free-solid-svg-icons";
import './Navbar.css';


const Navbar = () => {

  const [isVerticalNavbarOpen, setVerticalNavbarOpen] = useState(false);

  const verBar = () => {
    setVerticalNavbarOpen(!isVerticalNavbarOpen);
  };

  return (
    <>
      <nav>
        <a href=""><img src="pic/logo.png" alt="Logo" className="logo" /></a>
        <div id="navbar">
          <li> <a href="/Profile">Profilo</a> </li>
          <li> <a href="">Canali</a> </li>
          <li> <a href="">Shop</a> </li>
          <li> <a href="">Assistenza</a> </li>
        </div>

        <div id = "mobile" onClick={verBar}>

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



