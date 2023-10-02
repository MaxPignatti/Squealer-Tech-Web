import React, { useState } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleLogin = (event) => {
    /*da fare*/
  };

  return (
    <Container>
      <Row className="justify-content-center mt-5">
        <Col md={6}>
          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                <img src="/Logo.png" alt="Logo" />
              </div>
              <h2 className="text-center">Login</h2>
              {/*Bisogna aggiungere roba per validare il form (vedere se mail e password sono stati scritti correttamente) */}
              <Form onSubmit={handleLogin}>
                <Form.Group controlId="formBasicEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    aria-label="Email Address"
                    aria-describedby="emailHelp"
                  />
                </Form.Group>

                <Form.Group controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    aria-label="Password"
                  />
                </Form.Group>

                <Button variant="primary" type="submit" block>
                  Login
                </Button>
              </Form>
            </Card.Body>
            <Card.Footer className="text-center">
              <p>
                Don't have an account? <a href="/register">Register</a>
              </p>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
