import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, CardBody} from "react-bootstrap";
import { useAuth } from '../AuthContext';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Hashtag = () => {
    const { isAuthenticated } = useAuth();
    const [hashtag, setHashtag] = useState('');
    const [messages, setMessages] = useState([]);

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
      }

      const handleSearchHastag = async (e) => {
        e.preventDefault();
        const userDataCookie = Cookies.get('user_data');
        if (userDataCookie) {
          const userData = JSON.parse(userDataCookie);
          try {
            const response = await fetch(`http://localhost:3500/squeels/${hashtag}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ username: userData.username })
            });
      
            if (response.status === 200) {
              const data = await response.json();
              setMessages(data); // Aggiorna i messaggi con quelli filtrati per hashtag
            } else {
              console.error('hashtag non trovato', response.status);
            }
          } catch (error) {
            console.error('Errore nella chiamata API:', error);
          }
        }
      };
      
    return(
        <>
            <h1 className="mb-4">Qui puoi cercare e filtrare i messaggi per Hastag</h1>

            <Form className="mb-4" onSubmit={handleSearchHastag}>
            <Form.Group as={Row} controlId="formPlaintextHashtag">
                <Col sm="10">
                <Form.Control
                    type="text"
                    placeholder="Cerca per hashtag..."
                    value={hashtag}
                    onChange={(e) => setHashtag(e.target.value)}
                />
                </Col>
                <Col sm="2">
                <Button variant="primary" type="submit">Cerca</Button>
                </Col>
            </Form.Group>
            </Form>


            <div className="mb-4">
            <h3>Ultime Ricerche</h3>
            </div>

            <Row>
                {messages.map((message) => (
                    <Col key={message._id} sm={12}>
                    </Col>
                ))}
            </Row>


        </>
  
        
    );

};

export default Hashtag;