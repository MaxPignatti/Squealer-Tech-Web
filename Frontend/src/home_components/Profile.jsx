import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, CardBody } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import Cookies from 'js-cookie';
import { useAuth } from '../AuthContext';
import { Navigate } from 'react-router-dom';
import './Profile_style.css';

const Profile = () => {
  const { isAuthenticated } = useAuth();
  const [userData, setUserData] = useState({}); // Declare userData using useState

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    const userDataCookie = Cookies.get('user_data');
    if (userDataCookie) {
      const userData = JSON.parse(userDataCookie);
      const username = userData.username;

      fetch(`http://localhost/usr/${username}`)
        .then((response) => {
          if (response.status === 200) {
            return response.json();
          } else {
            throw new Error('API call failed');
          }
        })
        .then((data) => {
          setUserData(data);
        })
        .catch((error) => {
          console.error('API call error:', error);
        });
    } else {
      console.error('User data not found in cookies');
    }
  }, []);

  return (
    <>
      <Container>
        <Row className="justify-content-center mt-5">
          <Col md={6}>
            <Card>
              <Card.Body>
                <div>
                  <FontAwesomeIcon icon={faUser} id="userLogo" />
                </div>
                <div>
                  <p>First Name: {userData.firstName}</p>
                  <p>Last Name: {userData.lastName}</p>
                  <p>Username: {userData.username}</p>
                  <p>Email: {userData.email}</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Profile;
