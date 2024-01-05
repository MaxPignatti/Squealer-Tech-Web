import React, { useState, useEffect  } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "./AuthContext";
import Cookies from 'js-cookie';
import Message from "./home_components/Message"; 

const LoginPage = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const [trendingMessages, setTrendingMessages] = useState([]);

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      };
  
      const response = await fetch('http://localhost:3500/login', requestOptions);
      if (response.status === 200) {
        const data = await response.json();
        if (data && data.user_data) {
          const { username, accessToken } = data.user_data;
  
          const userData = {
            username: username,
            access_token: accessToken,
          };
  
          Cookies.set('user_data', JSON.stringify(userData), { expires: 1 });
  
          login();
          console.log('Navigating to /home...');
          navigate('/');
        } else {
          setErrorMessage('Access token not found in the response');
        }
      } else {
        const data = await response.json();
        setErrorMessage(data.error);
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    const fetchTrendingMessages = async () => {
      try {
        const response = await fetch('http://localhost:3500/api/topMessages');
        if (response.ok) {
          const data = await response.json();
          setTrendingMessages(data);
        } else {
          console.error('Failed to fetch trending messages');
        }
      } catch (error) {
        console.error('Error fetching trending messages:', error);
      }
    };

    fetchTrendingMessages();
  }, []);

  return (
    <Container>
      <Row className="justify-content-center mt-5">
        <Col md={6}>
          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                <img 
                  src="pic/logo.png" 
                  alt="Logo" 
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>
              <h2 className="text-center">Login</h2>
              <Form onSubmit={handleLogin}>
                <Form.Group controlId="formBasicUsername">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    aria-label="Username"
                  />
                </Form.Group>

                <Form.Group controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <div className="password-input">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      aria-label="Password"
                    />
                    <span
                      className="password-toggle"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <FontAwesomeIcon icon={faEyeSlash} />
                      ) : (
                        <FontAwesomeIcon icon={faEye} />
                      )}
                    </span>
                  </div>
                </Form.Group>

                <Button variant="primary" type="submit" block={true.toString()}>
                  Login
                </Button>

                {errorMessage && (
                  <div className="text-danger mt-2">
                    {errorMessage}
                  </div>
                )}

              </Form>
            </Card.Body>
            <Card.Footer className="text-center">
              <p>
                Don't have an account? <Link to="/registration">Register</Link>
              </p>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
      <Row className="justify-content-center mt-3">
        <Col md={6}>
          <h3>Trending Messages</h3>
          {trendingMessages.map((channelInfo) => (
            <div key={channelInfo.channelName}>
              <h4>{channelInfo.channelName}</h4>
              {channelInfo.messages.map((message) => (
                <Message
                  key={message._id}  
                  message={message} 
                />
              ))}
            </div>
          ))}
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
