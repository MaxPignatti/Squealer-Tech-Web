import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "./AuthContext";
import Cookies from "js-cookie";
import Message from "./home_components/Message";
import { BASE_URL } from "./config";

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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      };

      const response = await fetch(`${BASE_URL}/login`, requestOptions);
      if (response.status === 200) {
        const data = await response.json();
        if (data?.user_data) {
          const { username, accessToken } = data.user_data;

          const userData = {
            username: username,
            access_token: accessToken,
          };

          Cookies.set("user_data", JSON.stringify(userData), { expires: 1 });

          login();
          navigate("/");
        } else {
          setErrorMessage("Access token not found in the response");
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
        const response = await fetch(`${BASE_URL}/api/topMessages`);
        if (response.ok) {
          const data = await response.json();
          setTrendingMessages(data);
        } else {
          console.error("Failed to fetch trending messages");
        }
      } catch (error) {
        console.error("Error fetching trending messages:", error);
      }
    };

    fetchTrendingMessages();
  }, []);

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
                Login
              </h2>
              <Form onSubmit={handleLogin}>
                <Form.Group controlId="formBasicUsername" className="mb-4">
                  <Form.Label style={{ color: "green" }}>Username</Form.Label>
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

                <Form.Group controlId="formBasicPassword" className="mb-4">
                  <Form.Label style={{ color: "green" }}>Password</Form.Label>
                  <div className="input-group">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      aria-label="Password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <FontAwesomeIcon icon={faEyeSlash} />
                      ) : (
                        <FontAwesomeIcon icon={faEye} />
                      )}
                    </button>
                  </div>
                </Form.Group>

                <Button
                  variant="success"
                  type="submit"
                  block={true.toString()}
                  style={{ background: "purple" }}
                >
                  Login
                </Button>

                {errorMessage && (
                  <div className="text-danger mt-3">{errorMessage}</div>
                )}
              </Form>
            </Card.Body>
            <Card.Footer className="text-center mt-4">
              <p style={{ color: "red" }}>
                Don't have an account? <Link to="/registration">Register</Link>
              </p>
            </Card.Footer>
            <Card.Footer className="text-center">
              <p style={{ color: "orange" }}>
                <a href="https://site222327.tw.cs.unibo.it/smm">
                  Sei un SMM? Premi qui
                </a>
              </p>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
      <Row className="justify-content-center mt-5">
        <Col md={8}>
          <h3
            className="text-center"
            style={{ color: "red", marginBottom: "15px" }}
          >
            TRENDING MESSAGES
          </h3>
          {trendingMessages
            .filter((channelInfo) =>
              channelInfo.messages.some((message) => message.replyTo === null)
            )
            .map((channelInfo, index) => (
              <div key={channelInfo.channelName}>
                {index !== 0 && <hr style={{ margin: "20px 0" }} />}
                <h4 style={{ color: "black" }}>{channelInfo.channelName}</h4>
                {channelInfo.messages
                  .filter((message) => message.replyTo === null)
                  .map((message) => (
                    <Message key={message._id} message={message} />
                  ))}
              </div>
            ))}
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
