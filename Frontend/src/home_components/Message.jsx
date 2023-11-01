import React from 'react';
import { Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';

const Message = ({ message, handleReaction }) => {
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
  );
};

export default Message;
