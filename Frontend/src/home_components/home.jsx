import React from 'react';
import './home_style.css';
import Navbar from './Navbar';
import Profile from './Profile';
import { Routes, Route, Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '../AuthContext';
import { Navigate } from 'react-router-dom';
import MainPage from './MainPage';

const HomePage = () => {
  const {isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  
  return (
    <>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/*" element={<MainPage />} />
          <Route path="/Profile" element={<Profile />} />
        </Routes>
      </div>
    </>

    

  );
};

export default HomePage;