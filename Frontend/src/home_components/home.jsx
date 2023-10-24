import React from 'react';
import './home_style.css';
import Navbar from './Navbar';
import Profile from './Profile';
import { Routes, Route, Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '../AuthContext'; // Import the useAuth hook
import { Navigate } from 'react-router-dom';
import InputSqueel from './InputSqueel';

const HomePage = () => {
  const {isAuthenticated } = useAuth(); // Use the useAuth hook to get authentication status

  // If the user is not authenticated, redirect to the login page
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  
  return (
    <>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/*" element={<InputSqueel />} />
          <Route path="/Profile" element={<Profile />} />
        </Routes>
      </div>
    </>

    

  );
};

export default HomePage;


    /*

      let Component;
  switch(window.location.pathname){

    case"/Profile":
    Component =<Profile/>;
    break;
    default:
    Component = <InputSqueel/>;
    break;
  }
    <Router>
      <>
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<InputSqueel />} />
            <Route path="/Profile" element={<Profile />} />
          </Routes>
        </div>
      </>
    </Router>

  
    #######################################################
    
    <Container>
      <Navbar/>
      <Row className="justify-content-center mt-5">
        <Col md={6}>
          <div className="text-center">
            <h2>Welcome to the Home Page</h2>
            <p>This is your home page content.</p>
          </div>
        </Col>
      </Row>
      
    </Container>

    */
