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
import { useAuth } from "../AuthContext";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import Squeals from "./Squeals";

const Hashtag = () => {
  const { isAuthenticated } = useAuth();
  const [hashtag, setHashtag] = useState("");
  const [tempHashtag, setTempHashtag] = useState("");
  //const [messages, setMessages] = useState([]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const handleSearchClick = () => {
    setHashtag(tempHashtag);
  };

  const handleReset = () => {
    setHashtag("");
    setTempHashtag("");
  };

  return (
    <>
      <h1 className="mb-4">
        Qui puoi cercare e filtrare i messaggi per Hastag
      </h1>

      <Form className="mb-4">
        <Form.Group as={Row} controlId="formPlaintextHashtag">
          <Col sm="10">
            <Form.Control
              type="text"
              placeholder="Cerca per hashtag..."
              value={tempHashtag}
              onChange={(e) => setTempHashtag(e.target.value)}
            />
          </Col>
          <Col sm="2">
            <Button variant="primary" onClick={handleSearchClick}>
              Cerca
            </Button>
            <Button variant="danger" className="ml-2" onClick={handleReset}>
              Reset
            </Button>
          </Col>
        </Form.Group>
      </Form>

      <Squeels hashtag={hashtag} />
    </>
  );
};

export default Hashtag;
