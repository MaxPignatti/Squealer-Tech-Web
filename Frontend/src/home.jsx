import React from 'react';
import Navbar from './home_components/Navbar';

import { Container, Row, Col } from 'react-bootstrap';

const HomePage = () => {
  return (
    
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
    

  );
};

export default HomePage;
