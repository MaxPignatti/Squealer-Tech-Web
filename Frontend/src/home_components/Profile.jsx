import Navbar from './Navbar';
import React, { useState } from "react";
import { Container, Row, Col, Card, Form, Button, CardBody } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faUser} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import './Profile_style.css';


const Profile = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",
        socialMediaManagerEmail: "",
      });


    return(
    <>
        <Navbar/>
        <Container>
            <Row className="justify-content-center mt-5">
                <Col md={6}>
                    <Card>
                        <Card.Body>
                        <div>
                            <FontAwesomeIcon icon={faUser} id="userLogo"/>
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