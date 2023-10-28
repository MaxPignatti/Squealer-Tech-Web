import React, { useState, useEffect } from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import Cookies from 'js-cookie';

const Squeels = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchSqueels = async () => {
        const userDataCookie = Cookies.get('user_data');
        if (userDataCookie) {
            const userData = JSON.parse(userDataCookie);
            const username = userData.username;
            try {
                const response = await fetch(`http://localhost:3500/Squeels/${username}`);
                const data = await response.json();
                setMessages(data);
            } catch (error) {
                console.error(error);
            }
        }
    };

    fetchSqueels();
  }, []);

  const sortedMessages = [...messages].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <Container>
      <Row className="justify-content-center">
        <Col xs={12} md={8}>
          {sortedMessages.map((message) => (
            <Card key={message._id} className="mb-3">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="mr-3">
                  <img
                    src={message.profileImage}
                    alt="Profile Image"
                    style={{ maxWidth: '50px', borderRadius: '50%' }}
                  />
                </div>
                <div>
                  <strong>{message.user}:</strong> <br />
                  "{message.text}"
                </div>
              </div>
              {message.image && (
                <div className="text-center my-3">
                  <img
                    src={message.image}
                    alt="Message Image"
                    style={{ maxWidth: '100%' }}
                  />
                </div>
              )}
              <div className="d-flex">
                <small className="text-muted text-right">
                  <em>
                    Posted at: {new Date(message.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
                  </em>
                </small>
              </div>
            </Card.Body>
          </Card>
          ))}
        </Col>
      </Row>
    </Container>
  );
  
};

export default Squeels;
