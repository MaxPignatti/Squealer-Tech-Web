import React, { useState, useEffect, useRef  } from 'react';
import { Card, Button, Form, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import Maps from './Maps';
import { marked } from 'marked';
import ReplySqueel from './ReplySqueal';
import { useMessageRefs } from '../MessageRefsContext';

const Message = ({ message, handleReaction, seteditMessage, editMessage, handleSaveChanges, currentUser, scrollToMessage }) => {
  const [editedText, setEditedText] = useState(message.text);
  const [linkData, setLinkData] = useState([]);
  const [showReply, setShowReply] = useState(false);
  const [originalMessageUser, setOriginalMessageUser] = useState(null);
  const [originalMessageId, setOriginalMessageId] = useState(null);
  const messageRef = useRef(null);
  const { setRef } = useMessageRefs();

  useEffect(() => {
    if (message.replyTo != null) {
      // Esempio di chiamata API per ottenere il messaggio originale
      fetch(`http://localhost:3500/message/${message.replyTo}`)
        .then(response => response.json())
        .then(data => {
          setOriginalMessageUser(data.user);
          setOriginalMessageId(data._id);
        })
        .catch(error => console.error('Errore nel recupero del messaggio originale:', error));
    }
  });

  useEffect(() => {
    const positions = [];
    const regex = /\[([^\]]+)\]\(([^\)]+)\)/g;
    let match;
    while ((match = regex.exec(message.text)) != null) {
      positions.push({
        text: match[1],
        url: match[2],
        startText: match.index + 1,
        endText: match.index + match[0].indexOf(']'),
        startUrl: match.index + match[0].indexOf('(') + 1,
        endUrl: regex.lastIndex - 1
      });
    }
    setLinkData(positions);
  }, [message.text]);

  useEffect(() => {
    setRef(message._id, messageRef);
  }, [message._id, setRef]);
  
  const handleReplyClick = () => {
    setShowReply(!showReply);
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    let isEditAllowed = true;

    linkData.forEach(({ startText, endText, startUrl, endUrl, url }) => {
      const originalTextInsideBrackets = message.text.substring(startText, endText);
      const newTextInsideBrackets = newText.substring(startText, endText);
      const originalUrl = message.text.substring(startUrl, endUrl);
      const newUrl = newText.substring(startUrl, endUrl);

      // Allow changes only inside the square brackets and prevent changes to the URL and parentheses
      if (originalUrl !== newUrl || originalTextInsideBrackets.length !== newTextInsideBrackets.length) {
        isEditAllowed = false;
      }
    });

    if (isEditAllowed) {
      setEditedText(newText);
    } else {
      alert("Non è possibile modificare le parentesi tonde o l'URL dei link!");
    }
  };

  const handleSaveClick = () => {
    handleSaveChanges(message._id, editedText);
  };

  const renderText = (text) => {
    const textWithLinks = text.replace(/\[([^\]]+)\]\(((?!http:\/\/|https:\/\/).+)\)/g, '[$1](http://$2)');
    const rawMarkup = marked.parse(textWithLinks);
    return { __html: rawMarkup };
  };

  return (
    <Card ref={messageRef} key={message._id} className="mb-3">
      <Card.Body>
        {message.replyTo && (
          <div className="reply-header">
            Risposta a <a href="#" onClick={() => scrollToMessage(originalMessageId)}>Squeal di {originalMessageUser}</a>
          </div>
        )}
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
            <div dangerouslySetInnerHTML={renderText(message.text)} /> {/* Visualizza il testo interpretato come Markdown */}
          </div>
        </div>
  
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
          <Maps position={message.location} />
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
            <Button onClick={() => seteditMessage(true)}>
              <FontAwesomeIcon icon={faPenToSquare} />
            </Button>
          )}
  
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
                  value={editedText}
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

        <button onClick={handleReplyClick}>Rispondi</button>

        {showReply && <ReplySqueel originalMessage={message}/>}
      </Card.Body>
    </Card>
  );  
};

export default Message;
