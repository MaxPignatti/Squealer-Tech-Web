import React, { useState, useEffect } from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import Cookies from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import Message from './Message';

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
          const updatedMessage = messages.find((message) => message._id === messageId);
          const updatedData = await response.json();
          
          updatedMessage.positiveReactions = updatedData.positiveReactions;
          updatedMessage.negativeReactions = updatedData.negativeReactions;

          setMessages([...messages]); // Aggiorna lo stato
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
            <Message
              key={message._id}
              message={message}
              handleReaction={handleReaction}
            />
          ))}
        </Col>
      </Row>
    </Container>
  );
};

export default Squeels;