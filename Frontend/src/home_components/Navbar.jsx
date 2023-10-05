import React, { useState } from 'react';
import './Navbar.css'; 

const Navbar = () => {
  const [isVerticalNavbarOpen, setVerticalNavbarOpen] = useState(false);

  const verBar = () => {
    setVerticalNavbarOpen(!isVerticalNavbarOpen);
  };

  return (
    <div className="navbar">
      <div className="left-section">
        <img src="pic/logo.png" alt="Logo" className="logo" />
        <h1 className="title">Squealer</h1>
      </div>
      <div className="right-section">
        <button className="nav-button">
            <img src="pic/campanella.png" alt="Logo" className="logo_not"/>
        </button>
        <button className="nav-button"onClick={verBar}>Menù</button>
        {isVerticalNavbarOpen && (
          <div className="vertical-navbar">
            {}
            <button onClick={verBar}>Close Vertical Navbar</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;



