import React, { useState, useEffect } from "react";
import {
  Card,
  Col,
  Container,
  Row,
  Button,
  ButtonGroup,
} from "react-bootstrap";
import Cookies from "js-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp, faThumbsDown } from "@fortawesome/free-solid-svg-icons";
import Message from "./Message";
import { useMessageRefs } from "../MessageRefsContext";

const Squeels = ({ hashtag }) => {
  const [messages, setMessages] = useState([]);
  const [viewMode, setViewMode] = useState("public"); // 'public' o 'private'
  const [currentUser, setCurrentUser] = useState(null);
  const { messageRefs } = useMessageRefs();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      const userDataCookie = Cookies.get("user_data");
      if (userDataCookie) {
        const userData = JSON.parse(userDataCookie);
        const username = userData.username;
        setCurrentUser(username);

        let baseUrl =
          viewMode === "public"
            ? `http://localhost:3500/Squeels/${username}`
            : `http://localhost:3500/privateMessages/${username}`;

        const url = hashtag
          ? `${baseUrl}/${encodeURIComponent(hashtag)}`
          : baseUrl;

        try {
          const response = await fetch(url);
          const data = await response.json();
          setMessages(data);
        } catch (error) {
          console.error(error);
        }
      }
    };
    if (!isEditing && !isReplying) {
      fetchMessages();
      const pollingInterval = setInterval(fetchMessages, 1000);
      return () => clearInterval(pollingInterval);
    }
  }, [viewMode, isEditing, isReplying, hashtag]);

  const handleReaction = async (messageId, isPositiveReaction) => {
    const userDataCookie = Cookies.get("user_data");
    if (userDataCookie) {
      const userData = JSON.parse(userDataCookie);
      const username = userData.username;
      try {
        const response = await fetch(
          `http://localhost:3500/Squeels/reaction/${messageId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              reaction: isPositiveReaction,
              username: username,
            }),
          }
        );

        if (response.status === 200) {
          const updatedMessage = messages.find(
            (message) => message._id === messageId
          );
          const updatedData = await response.json();

          updatedMessage.positiveReactions = updatedData.positiveReactions;
          updatedMessage.negativeReactions = updatedData.negativeReactions;

          setMessages([...messages]);
        } else {
          console.error("Failed to update reaction:", response.status);
        }
      } catch (error) {
        console.error("API call error:", error);
      }
    }
  };

  const handleEditButtonClick = (messageId) => {
    setIsEditing((prev) => !prev);
    setMessages((prevMessages) =>
      prevMessages.map((message) => ({
        ...message,
        isEditing:
          message._id === messageId ? !message.isEditing : message.isEditing,
      }))
    );
  };

  const scrollToMessage = (messageId) => {
    const ref = messageRefs.current[messageId];
    ref?.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const handleSaveChanges = async (messageId, editedText) => {
    const userDataCookie = Cookies.get("user_data");
    if (userDataCookie) {
      const userData = JSON.parse(userDataCookie);
      const username = userData.username;
      try {
        const response = await fetch(
          `http://localhost:3500/Squeels/edit/${messageId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: editedText, username: username }),
          }
        );

        if (response.status === 200) {
          const updatedMessage = messages.find(
            (message) => message._id === messageId
          );
          const updatedData = await response.json();

          updatedMessage.text = updatedData.text;

          setMessages([...messages]);

          handleEditButtonClick(messageId);
          setIsEditing(false);
        } else {
          console.error("Failed to save changes:", response.status);
        }
      } catch (error) {
        console.error("API call error:", error);
      }
    }
  };

  const onStartReplying = () => {
    setIsReplying(true);
  };

  const onEndReplying = () => {
    setIsReplying(false);
  };

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <Container>
      <Row className="justify-content-center my-3">
        <ButtonGroup>
          <Button
            variant={viewMode === "public" ? "primary" : "secondary"}
            onClick={() => setViewMode("public")}
          >
            Squeels Pubblici
          </Button>
          <Button
            variant={viewMode === "private" ? "primary" : "secondary"}
            onClick={() => setViewMode("private")}
          >
            Messaggi Privati
          </Button>
        </ButtonGroup>
      </Row>
      <Row className="justify-content-center">
        <Col xs={12} md={8}>
          {sortedMessages.length > 0 ? (
            sortedMessages.map((message) => (
              <Message
                key={message._id}
                message={message}
                handleReaction={handleReaction}
                editMessage={message.isEditing}
                seteditMessage={() => handleEditButtonClick(message._id)}
                handleSaveChanges={handleSaveChanges}
                currentUser={currentUser}
                scrollToMessage={scrollToMessage}
                onStartReplying={onStartReplying}
                onEndReplying={onEndReplying}
              />
            ))
          ) : (
            <div className="text-center mt-4">
              <p className="lead">
                {viewMode === "public"
                  ? "Al momento non ci sono Squeels pubblici da mostrare."
                  : "Non hai messaggi privati."}
              </p>
              {viewMode === "public" && (
                <p>
                  Iscriviti a dei canali per iniziare a esplorare i messaggi e
                  interagire con la community!
                </p>
              )}
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Squeels;
