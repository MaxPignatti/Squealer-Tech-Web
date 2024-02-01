import React, { useState } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    socialMediaManagerEmail: "",
  });

  const [errorMessage, setErrorMessage] = useState(""); // State for error message

  const handleRegister = async (event) => {
    event.preventDefault();

    try {
      // Send a POST request to your backend registration endpoint
      const response = await fetch("http://localhost:3500/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.status === 201) {
        window.location.href = "/login"; // Redirect to the login page
      } else {
        const data = await response.json();
        setErrorMessage(data.error); // Set the error message
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container>
      <Row className="justify-content-center mt-5">
        <Col xs={12} md={6}>
          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                <img
                  src="pic/logo.png"
                  alt="Logo"
                  style={{ maxWidth: "80%", height: "auto" }}
                />
              </div>
              <h2 className="text-center" style={{ color: "black" }}>
                Register
              </h2>
              <Form onSubmit={handleRegister}>
                <Form.Group controlId="formBasicFirstName" className="mb-4">
                  <Form.Label style={{ color: "green" }}>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formBasicLastName" className="mb-4">
                  <Form.Label style={{ color: "green" }}>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formBasicUsername" className="mb-4">
                  <Form.Label style={{ color: "green" }}>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formBasicEmail" className="mb-4">
                  <Form.Label style={{ color: "green" }}>
                    Email address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formBasicPassword" className="mb-4">
                  <Form.Label style={{ color: "green" }}>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                </Form.Group>

                <Form.Group
                  controlId="formBasicConfirmPassword"
                  className="mb-4"
                >
                  <Form.Label style={{ color: "green" }}>
                    Confirm Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                  />
                </Form.Group>

                <Button
                  variant="success"
                  type="submit"
                  block={true.toString()}
                  style={{ background: "purple" }}
                >
                  Register
                </Button>

                {errorMessage && (
                  <div className="text-danger mt-2">{errorMessage}</div>
                )}
              </Form>
            </Card.Body>
            <Card.Footer className="text-center mt-4">
              <p style={{ color: "red" }}>
                Already have an account? <Link to="/login">Login</Link>
              </p>
            </Card.Footer>
            <Card.Footer className="text-center">
              <p style={{ color: "orange" }}>
                <a href="http://localhost:8080/login">Sei un SMM? Premi qui</a>
              </p>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegistrationPage;
