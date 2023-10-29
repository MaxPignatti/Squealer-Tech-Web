import React, { useState, useEffect } from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import Cookies from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';

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

  const handleReaction = async (messageId, isPositiveReaction) => {
    const userDataCookie = Cookies.get('user_data');
    if (userDataCookie) {
      const userData = JSON.parse(userDataCookie);
      const username = userData.username;
      try {
        const response = await fetch(`http://localhost:3500/Squeels/reaction/${messageId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reaction: isPositiveReaction,  username: username}),
        });

        if (response.status === 200) {
          const updatedMessages = messages.map((message) =>
            message._id === messageId
              ? {
                  ...message,
                  positiveReactions: isPositiveReaction
                    ? message.positiveReactions + 1
                    : message.positiveReactions,
                  negativeReactions: !isPositiveReaction
                    ? message.negativeReactions + 1
                    : message.negativeReactions,
                }
              : message
          );
          setMessages(updatedMessages);
        } else {
          console.error('Failed to update reaction:', response.status);
        }
      } catch (error) {
        console.error('API call error:', error);
      }
    }
  };

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
                <div className="d-flex justify-content-end">
                  <small className="text-muted">
                    <em>
                      Posted at: {new Date(message.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
                    </em>
                  </small>
                </div>
                <div className="d-flex justify-content-between">
                  <div>
                    <button
                      className="btn btn-link"
                      onClick={() => handleReaction(message._id, true)}
                    >
                      <FontAwesomeIcon icon={faThumbsUp} />
                    </button>
                    <span>{message.positiveReactions}</span>
                  </div>
                  <div>
                    <button
                      className="btn btn-link"
                      onClick={() => handleReaction(message._id, false)}
                    >
                      <FontAwesomeIcon icon={faThumbsDown} />
                    </button>
                    <span>{message.negativeReactions}</span>
                  </div>
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
