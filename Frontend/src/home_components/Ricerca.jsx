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

const Ricerca = () => {
  const { isAuthenticated } = useAuth();
  const [hashtag, setHashtag] = useState("");
  const [tempHashtag, setTempHashtag] = useState("");
  const [user, setUser] = useState("");
  const [tempUser, setTempUser] = useState("");
  const [channel, setChannel] = useState("");
  const [tempChannel, setTempChannel] = useState("");
  const [text, setText] = useState("");
  const [tempText, setTempText] = useState("");

  const [searchCriteria, setSearchCriteria] = useState("user");
  const [tempSearchText, setTempSearchText] = useState("");

  //const [messages, setMessages] = useState([]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const handleSearchClick = () => {
    let newHashtag = "";
    let newUser = "";
    let newChannel = "";
    let newText = "";
  
    switch (searchCriteria) {
      case "user":
        newUser = tempSearchText;
        break;
      case "channel":
        newChannel = tempSearchText;
        break;
      case "hashtag":
        newHashtag = tempSearchText;
        break;
      case "text":
        newText = tempSearchText;
        break;
      default:
        break;
    }
  
    setHashtag(newHashtag);
    setUser(newUser);
    setChannel(newChannel);
    setText(newText);
    //console.log('cha',newChannel);
    //console.log('has',newHashtag);
    //console.log(hashtag);
  };
  ;

  const handleReset = () => {
    setTempSearchText(""); 
    setUser(""); 
    setChannel(""); 
    setHashtag(""); 
    setText(""); 
  };
  

  

  return (
    <Container>
      <Row className="justify-content-center mt-4">
        <Col xs={12} md={8}>
          <h1>Qui puoi cercare e filtrare i messaggi</h1>
      <Form className="mb-4" >
        <Form.Group as={Row} >
          <Col sm="2">
            <Form.Control
              as="select"
              value={searchCriteria}
              onChange={(e) => setSearchCriteria(e.target.value)}
            >
              <option value="user">User</option>
              <option value="channel">Channel</option>
              <option value="hashtag">Hashtag</option>
              <option value="text">Testo</option>
            </Form.Control>
          </Col>
          <Col sm="8">
            <Form.Control
              type="text"
              placeholder={`Cerca per ${searchCriteria}...`}
              value={tempSearchText}
              onChange={(e) => setTempSearchText(e.target.value)}
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

      <Squeals hashtag={hashtag} targetUsername={user} channel={channel} text={text}/>
      </Col>
      </Row>
    </Container>

  );
};

export default Ricerca;
