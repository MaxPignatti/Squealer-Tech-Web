import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  CardBody,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Cookies from "js-cookie";
import { useAuth } from "../AuthContext";
import { Navigate } from "react-router-dom";
import "./Profile_style.css";
import Navbar from "./Navbar";

const Profile = () => {
  const { isAuthenticated } = useAuth();
  const [userData, setUserData] = useState({});
  const [editChange, seteditChange] = useState(false);
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    const userDataCookie = Cookies.get("user_data");
    if (userDataCookie) {
      const userData = JSON.parse(userDataCookie);
      const username = userData.username;

      fetch(`http://localhost:3500/usr/${username}`)
        .then((response) => {
          if (response.status === 200) {
            return response.json();
          } else {
            throw new Error("API call failed");
          }
        })
        .then((data) => {
          const newData = {
            ...data,
            oldUserName: username,
          };
          setUserData(newData);
        })
        .catch((error) => {
          console.error("API call error:", error);
        });
    } else {
      console.error("User data not found in cookies");
    }
  }, []);

  const handleModificaPassword = () => {
    setShowChangePasswordForm(true);
  };

  const handleAnnullaPassword = () => {
    setShowChangePasswordForm(false);
  };

  const handleModifica = () => {
    seteditChange(true);
  };

  const handleUserChange = async () => {
    try {
      const response = await fetch(
        `http://localhost:3500/usr/${userData.oldUserName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      if (response.status === 200) {
        // Dopo che la modifica è stata completata con successo
        // Aggiorna i cookies con il nuovo username
        const updatedUserData = {
          ...userData,
          username: userData.username || userData.oldUserName,
        };
        Cookies.set("user_data", JSON.stringify(updatedUserData), {
          expires: 1,
        });

        seteditChange(false);
      } else {
        //console.error('Failed to save data:', response.status);
        const data = await response.json();
        setErrorMessage(data.error);
      }
    } catch (error) {
      console.error("API call error:", error);
    }
  };

  const handleUserPsw = async () => {
    try {
      const responsePassword = await fetch(
        `http://localhost:3500/usr/${userData.oldUserName}/password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      if (responsePassword.status === 200) {
        // Dopo che la modifica della password è stata completata con successo
        // Puoi gestire ulteriori azioni qui, ad esempio, reindirizzare l'utente
        setShowChangePasswordForm(false);
      } else {
        //console.error('Failed to update password:', responsePassword.status);
        const data = await responsePassword.json();
        setErrorMessage(data.error);
      }
    } catch (error) {
      console.error("API call error:", error);
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
          <Col xs={12} md={8} lg={6}>
            <Card>
              <Card.Body>
                <div>
                  <img
                    src={`${userData.profileImage}`}
                    alt="Profile Image"
                    style={{ maxWidth: "20%" }}
                  />
                </div>
                {editChange ? (
                  <Form>
                    <Form.Group controlId="formBasicProfileImage">
                      <Form.Label>Profile Image</Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        name="profileImage"
                        onChange={(e) => {
                          const reader = new FileReader();
                          reader.onload = () => {
                            setUserData({
                              ...userData,
                              profileImage: reader.result,
                            });
                          };
                          reader.readAsDataURL(e.target.files[0]);
                        }}
                      />
                    </Form.Group>

                    <Form.Group controlId="formBasicFirstName">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={userData.firstName}
                        onChange={(e) =>
                          setUserData({
                            ...userData,
                            firstName: e.target.value,
                          })
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
                  <div>
                    <p className="d-flex justify-content-center">
                      First Name: {userData.firstName}
                    </p>
                    <p className="d-flex justify-content-center">
                      Last Name: {userData.lastName}
                    </p>
                    <p className="d-flex justify-content-center">
                      Username: {userData.username}
                    </p>
                    <p className="d-flex justify-content-center">
                      Email: {userData.email}
                    </p>
                    <Button variant="primary" onClick={handleModifica}>
                      Modifica Profilo
                    </Button>
                    {showChangePasswordForm ? (
                      <Form>
                        <Form.Group controlId="formBasicOldPassword">
                          <Form.Label>Vecchia Password</Form.Label>
                          <Form.Control
                            type={showOldPassword ? "text" : "password"}
                            name="oldPassword"
                            placeholder="Vecchia Password"
                            onChange={(e) =>
                              setUserData({
                                ...userData,
                                oldPassword: e.target.value,
                              })
                            }
                          />
                          <span
                            className="password-toggle"
                            onClick={() => setShowOldPassword(!showOldPassword)}
                          >
                            {showOldPassword ? (
                              <FontAwesomeIcon icon={faEyeSlash} />
                            ) : (
                              <FontAwesomeIcon icon={faEye} />
                            )}
                          </span>
                        </Form.Group>

                        <Form.Group controlId="formBasicPassword">
                          <Form.Label>Nuova Password</Form.Label>
                          <Form.Control
                            type={showNewPassword ? "text" : "password"}
                            name="newPassword"
                            placeholder="Nuova Password"
                            onChange={(e) =>
                              setUserData({
                                ...userData,
                                newPassword: e.target.value,
                              })
                            }
                          />
                          <span
                            className="password-toggle"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <FontAwesomeIcon icon={faEyeSlash} />
                            ) : (
                              <FontAwesomeIcon icon={faEye} />
                            )}
                          </span>
                        </Form.Group>

                        <Button variant="primary" onClick={handleUserPsw}>
                          Salva Modifiche
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={handleAnnullaPassword}
                        >
                          Annulla
                        </Button>
                        {errorMessage && (
                          <div className="text-danger mt-2">{errorMessage}</div>
                        )}
                      </Form>
                    ) : (
                      <Button variant="info" onClick={handleModificaPassword}>
                        Modifica Password
                      </Button>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Profile;
