import React, { useState } from 'react';
import { Card, Button, Form, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import Maps from './Maps';

const Message = ({ message, handleReaction, seteditMessage, editMessage, handleSaveChanges, currentUser }) => {
  const [editedText, setEditedText] = useState(message.text);

  const handleTextChange = (e) => {
    setEditedText(e.target.value);
  };

  const handleSaveClick = () => {
    handleSaveChanges(message._id, editedText);
  };

  return (
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

        {/* Visualizzazione dei canali */}
        {message.channel && message.channel.length > 0 && (
          <div className="mb-2">
            {message.channel.map((channel, index) => (
              <Badge key={index} pill bg="secondary" className="mr-1">
                {channel}
              </Badge>
            ))}
          </div>
        )}

        {message.image && (
          <div className="text-center my-3">
            <img
              src={message.image}
              alt="Message Image"
              style={{ maxWidth: '100%' }}
            />
          </div>
        )}

        {message.location && message.location[0] != null && message.location[1] != null && (
          <Maps position= {message.location}/>
        )}

        <div className="d-flex justify-content-end">
          <small className="text-muted">
            <em>
            Pubblicato il {new Date(message.createdAt).toLocaleString('it-IT', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </em>
          </small>
        </div>
        <div className="d-flex justify-content-between">
          {currentUser === message.user && (
            <div>
              <Button onClick={() => seteditMessage(true)}>
                <FontAwesomeIcon icon={faPenToSquare} />
              </Button>
            </div>
          )}
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
        {editMessage && currentUser === message.user && (

          <div>
            <Form>
              <Form.Group controlId="formBasicEditText">
                <Form.Label>Modifica Testo</Form.Label>
                <Form.Control
                  type="text"
                  name="editedText"
                  value = {editedText}
                  onChange={handleTextChange}
                  />
              </Form.Group>
            </Form>

          <Button variant="primary" onClick={handleSaveClick}>
            Salva Modifiche
          </Button>
          <Button variant="secondary" onClick={() => seteditMessage(false)}>
            Annulla
          </Button>
        </div>

        )}

      </Card.Body>
    </Card>
  );
};

export default Message;

