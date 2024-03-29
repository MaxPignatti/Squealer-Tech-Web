import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  InputGroup,
  FormControl,
  Alert,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Cookies from "js-cookie";
import { useAuth } from "../AuthContext";
import { Navigate } from "react-router-dom";
import Navbar from "./Navbar";
import LogoutButton from "./LogoutButton";
import { BASE_URL } from "../config";

const Profile = () => {
  const { isAuthenticated } = useAuth();
  const [userData, setUserData] = useState({});
  const [editChange, setEditChange] = useState(false);
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);

  const [tempSMMEmail, setTempSMMEmail] = useState("");

  const [profileErrorMessage, setProfileErrorMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Refs per gestire il focus su Alert
  const errorRef = useRef(null);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    const userDataCookie = Cookies.get("user_data");
    if (userDataCookie) {
      const userData = JSON.parse(userDataCookie);
      const username = userData.username;

      fetch(`${BASE_URL}/usr/${username}`)
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
    setPasswordErrorMessage("");
  };

  const handleAnnullaPassword = () => {
    setShowChangePasswordForm(false);
    setPasswordErrorMessage("");
  };

  const handleModifica = () => {
    setEditChange(true);
    setProfileErrorMessage("");
  };

  const handleAnnulla = () => {
    setEditChange(false);
    setProfileErrorMessage("");
  };

  const handleAddSMM = () => {
    setUserData({ ...userData, socialMediaManagerEmail: tempSMMEmail });
    setTempSMMEmail("");
  };

  const handleRemoveSMM = () => {
    setUserData({ ...userData, socialMediaManagerEmail: null });
  };

  const handleUserChange = async () => {
    try {
      const response = await fetch(`${BASE_URL}/usr/${userData.oldUserName}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

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

        setEditChange(false);
      } else {
        const data = await response.json();
        setProfileErrorMessage(data.error);
      }
    } catch (error) {
      console.error("API call error:", error);
    }
  };

  const handleUserPsw = async () => {
    try {
      const responsePassword = await fetch(
        `${BASE_URL}/usr/${userData.oldUserName}/password`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      if (responsePassword.status === 200) {
        setShowChangePasswordForm(false);
      } else {
        const data = await responsePassword.json();
        setPasswordErrorMessage(data.error);
      }
    } catch (error) {
      console.error("API call error:", error);
    }
  };

  return (
    <>
      <Navbar />
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6}>
            <Card className="mb-4 shadow-sm">
              <Card.Body>
                <div className="text-center mb-3">
                  <img
                    src={`${userData.profileImage}`}
                    alt="Profile"
                    style={{ maxWidth: "20%", borderRadius: "50%" }}
                  />
                </div>
                {editChange || showChangePasswordForm ? (
                  <>
                    {editChange && (
                      <>
                        <Form>
                          <Form.Group
                            controlId="formBasicProfileImage"
                            className="mb-3"
                          >
                            <Form.Label>Profile Image</Form.Label>
                            <Form.Control
                              type="file"
                              accept="image/*"
                              aria-label="Carica una nuova immagine del profilo"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    setUserData({
                                      ...userData,
                                      profileImage: reader.result,
                                    });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </Form.Group>

                          <Form.Group
                            controlId="formBasicFirstName"
                            className="mb-3"
                          >
                            <Form.Label>First Name</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Enter first name"
                              value={userData.firstName}
                              aria-label="inserisci il nuovo nome"
                              onChange={(e) =>
                                setUserData({
                                  ...userData,
                                  firstName: e.target.value,
                                })
                              }
                            />
                          </Form.Group>

                          <Form.Group
                            controlId="formBasicLastName"
                            className="mb-3"
                          >
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Enter last name"
                              value={userData.lastName}
                              aria-label="inserisci il nuovo cognome"
                              onChange={(e) =>
                                setUserData({
                                  ...userData,
                                  lastName: e.target.value,
                                })
                              }
                            />
                          </Form.Group>

                          <Form.Group
                            controlId="formBasicUsername"
                            className="mb-3"
                          >
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Enter username"
                              value={userData.username}
                              aria-label="inserisci il nuovo username"
                              onChange={(e) =>
                                setUserData({
                                  ...userData,
                                  username: e.target.value,
                                })
                              }
                            />
                          </Form.Group>

                          <Form.Group
                            controlId="formBasicEmail"
                            className="mb-3"
                          >
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                              type="email"
                              placeholder="Enter email"
                              value={userData.email}
                              aria-label="inserisci la nuova email"
                              onChange={(e) =>
                                setUserData({
                                  ...userData,
                                  email: e.target.value,
                                })
                              }
                            />
                          </Form.Group>
                          <Form.Group
                            controlId="formBasicSMMEmail"
                            className="mb-3"
                          >
                            <Form.Label>
                              Email del Social Media Manager
                            </Form.Label>
                            {userData.socialMediaManagerEmail ? (
                              // Visualizzazione se l'SMM è già configurato
                              <InputGroup>
                                <FormControl
                                  type="text"
                                  value={userData.socialMediaManagerEmail}
                                  readOnly
                                />
                                <Button
                                  variant="outline-danger"
                                  onClick={handleRemoveSMM}
                                >
                                  Rimuovi SMM
                                </Button>
                              </InputGroup>
                            ) : (
                              // Campo di input e pulsante "Aggiungi" se l'SMM non è configurato
                              <InputGroup>
                                <FormControl
                                  type="email"
                                  placeholder="Inserisci l'email del SMM"
                                  value={tempSMMEmail}
                                  onChange={(e) =>
                                    setTempSMMEmail(e.target.value)
                                  }
                                />
                                <Button
                                  variant="outline-success"
                                  onClick={handleAddSMM}
                                >
                                  Aggiungi
                                </Button>
                              </InputGroup>
                            )}
                            <Form.Text className="text-muted">
                              {userData.socialMediaManagerEmail
                                ? `SMM attuale: ${userData.socialMediaManagerEmail}`
                                : "Nessun SMM configurato"}
                            </Form.Text>
                          </Form.Group>
                        </Form>
                        <div className="d-flex justify-content-between">
                          <Button variant="success" onClick={handleUserChange}>
                            Salva Modifiche
                          </Button>
                          <Button variant="secondary" onClick={handleAnnulla}>
                            Annulla
                          </Button>
                        </div>
                        {profileErrorMessage && (
                          <Alert
                            variant="danger"
                            ref={errorRef}
                            aria-live="assertive"
                            className="mt-2"
                          >
                            {profileErrorMessage}
                          </Alert>
                        )}
                      </>
                    )}

                    {showChangePasswordForm && (
                      <>
                        <Form>
                          <Form.Group
                            controlId="formBasicOldPassword"
                            className="mb-3"
                          >
                            <Form.Label>Vecchia Password</Form.Label>
                            <InputGroup>
                              <FormControl
                                type={showOldPassword ? "text" : "password"}
                                placeholder="Vecchia Password"
                                aria-label="inserisci la vecchia password"
                                onChange={(e) =>
                                  setUserData({
                                    ...userData,
                                    oldPassword: e.target.value,
                                  })
                                }
                              />
                              <Button
                                variant="outline-secondary"
                                onClick={() =>
                                  setShowOldPassword(!showOldPassword)
                                }
                              >
                                <FontAwesomeIcon
                                  icon={showOldPassword ? faEyeSlash : faEye}
                                />
                              </Button>
                            </InputGroup>
                          </Form.Group>

                          <Form.Group
                            controlId="formBasicNewPassword"
                            className="mb-3"
                          >
                            <Form.Label>Nuova Password</Form.Label>
                            <InputGroup>
                              <FormControl
                                type={showNewPassword ? "text" : "password"}
                                placeholder="Nuova Password"
                                aria-label="inserisci la nuova password"
                                onChange={(e) =>
                                  setUserData({
                                    ...userData,
                                    newPassword: e.target.value,
                                  })
                                }
                              />
                              <Button
                                variant="outline-secondary"
                                onClick={() =>
                                  setShowNewPassword(!showNewPassword)
                                }
                              >
                                <FontAwesomeIcon
                                  icon={showNewPassword ? faEyeSlash : faEye}
                                />
                              </Button>
                            </InputGroup>
                          </Form.Group>
                        </Form>

                        <div className="d-flex justify-content-between">
                          <Button variant="primary" onClick={handleUserPsw}>
                            Salva Modifiche
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={handleAnnullaPassword}
                          >
                            Annulla
                          </Button>
                        </div>
                        {passwordErrorMessage && (
                          <Alert
                            variant="danger"
                            ref={errorRef}
                            aria-live="assertive"
                            className="mt-2"
                          >
                            {passwordErrorMessage}
                          </Alert>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div className="d-flex flex-column align-items-center">
                      <p>First Name: {userData.firstName}</p>
                      <p>Last Name: {userData.lastName}</p>
                      <p>Username: {userData.username}</p>
                      <p>Email: {userData.email}</p>
                      <p>
                        Email del SMM:{" "}
                        {userData.socialMediaManagerEmail || "Nessun SMM"}
                      </p>
                    </div>
                    <div className="d-flex flex-column align-items-center">
                      <Button
                        variant="primary"
                        onClick={handleModifica}
                        className="mb-2"
                      >
                        Modifica Profilo
                      </Button>
                      <Button variant="info" onClick={handleModificaPassword}>
                        Modifica Password
                      </Button>
                    </div>
                  </>
                )}
              </Card.Body>
            </Card>
            <div className="d-grid gap-2">
              <LogoutButton />
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Profile;
