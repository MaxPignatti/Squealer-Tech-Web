import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, CardBody} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import Cookies from 'js-cookie';
import { useAuth } from '../AuthContext';
import { Navigate } from 'react-router-dom';
import './Profile_style.css';
import Navbar from './Navbar';


const Profile = () => {
  const { isAuthenticated } = useAuth();
  const [userData, setUserData] = useState({});
  const [editChange, seteditChange] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    const userDataCookie = Cookies.get('user_data');
    if (userDataCookie) {
      const userData = JSON.parse(userDataCookie);
      const username = userData.username;

      fetch(`http://localhost:3500/usr/${username}`)
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


  
  const handleModifica = () => {
    seteditChange(true);
  };

  const handleUserChange = async () => {
    try {
      const response = await fetch(`http://localhost:3500/usr/${userData.username}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.status === 200) {
        seteditChange(false);
      } else {
        console.error('Failed to save data:', response.status);
      }
    } catch (error) {
      console.error('API call error:', error);
    }
  };

  const handleAnnulla = () => {
    seteditChange(false);
  };


  return (
    <>
      <Navbar />
      <Container>
        <Row className="justify-content-center mt-5">
          <Col md={6}>
            <Card>
              <Card.Body>
                <div>
                  <img src={`${userData.profileImage}`} alt="Profile Image" style={{ maxWidth: '20%' }} />
                </div>
                {editChange ? (
                  <Form>
                    <Form.Group controlId="formBasicFirstName">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={userData.firstName}
                        onChange={(e) =>
                          setUserData({ ...userData, firstName: e.target.value })
                        }
                        required
                      />
                    </Form.Group>

                    <Form.Group controlId="formBasicLastName">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={userData.lastName}
                        onChange={(e) =>
                          setUserData({ ...userData, lastName: e.target.value })
                        }
                        required 
                      />
                    </Form.Group>


                    <Form.Group controlId="formBasicUserName">
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={userData.username}
                        onChange={(e) =>
                          setUserData({ ...userData, username: e.target.value })
                        }
                        required 
                      />
                    </Form.Group>


                    <Form.Group controlId="formBasicEmail">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="text"
                        name="email"
                        value={userData.email}
                        onChange={(e) =>
                          setUserData({ ...userData, email: e.target.value })
                        }
                        required 
                      />
                    </Form.Group>

                    

                    <Button variant="success" onClick={handleUserChange}>
                      Salva Modifiche
                    </Button>
                    <Button variant="secondary" onClick={handleAnnulla}>
                      Annulla
                    </Button>
                    </Form>
              ) : (
                <div >
                  <p className="d-flex justify-content-center">First Name: {userData.firstName}</p>
                  <p className="d-flex justify-content-center">Last Name: {userData.lastName}</p>
                  <p className="d-flex justify-content-center">Username: {userData.username}</p>
                  <p className="d-flex justify-content-center">Email: {userData.email}</p>
                  <Button variant="primary" onClick={handleModifica}>
                    Modifica i tuoi dati
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  </>
);
              }

export default Profile;

