import React, { useState, useEffect } from "react";
import { Col, Container, Row, Button, ButtonGroup } from "react-bootstrap";
import Cookies from "js-cookie";
import Message from "./Message";
import { useMessageRefs } from "../MessageRefsContext";
import PropTypes from "prop-types";
import { BASE_URL } from "../config";

const Squeals = ({ searchType, searchText }) => {
  const [messages, setMessages] = useState([]);
  const [viewMode, setViewMode] = useState("public"); // 'public' o 'private'
  const [currentUser, setCurrentUser] = useState(null);
  const { messageRefs } = useMessageRefs();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [customPublicMessage, setCustomPublicMessage] = useState("");
  const [customPrivateMessage, setCustomPrivateMessage] = useState("");

  const buildUrl = (viewMode, username, searchType, searchText) => {
    let baseUrl = `${BASE_URL}/${
      viewMode === `public`
        ? `messages/public/getAllMessages`
        : `privateMessages`
    }/${username}`;
    if (searchType && searchText) {
      const encodedSearchText = encodeURIComponent(searchText);
      const endpoints = {
        hashtag: `hashtag`,
        channel: `channel`,
        text: `text`,
        user: `targetUsername`,
      };
      baseUrl += `/${endpoints[searchType]}/${encodedSearchText}`;
    }
    return baseUrl;
  };

  const fetchAndSetMessages = async (url, setMessages, setCustomMessages) => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      setMessages(data.messages || []);
      setCustomMessages(data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      setMessages([]);
    }
  };

  useEffect(() => {
    const userDataCookie = Cookies.get("user_data");
    if (userDataCookie && !isEditing && !isReplying) {
      const userData = JSON.parse(userDataCookie);
      setCurrentUser(userData.username);
      const url = buildUrl(viewMode, userData.username, searchType, searchText);
      fetchAndSetMessages(
        url,
        setMessages,
        ({ privateMessage, publicMessage }) => {
          setCustomPrivateMessage(privateMessage);
          setCustomPublicMessage(publicMessage);
        }
      );
      const pollingInterval = setInterval(() => {
        fetchAndSetMessages(
          url,
          setMessages,
          ({ privateMessage, publicMessage }) => {
            setCustomPrivateMessage(privateMessage);
            setCustomPublicMessage(publicMessage);
          }
        ).catch(console.error);
      }, 1000);
      return () => clearInterval(pollingInterval);
    }
  }, [viewMode, isEditing, isReplying, searchType, searchText]);

  const handleReaction = async (messageId, reactionType) => {
    const userDataCookie = Cookies.get("user_data");
    if (userDataCookie) {
      const userData = JSON.parse(userDataCookie);
      const username = userData.username;
      try {
        const response = await fetch(
          `${BASE_URL}/messages/${messageId}/reactions/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              reaction: reactionType,
              username: username,
            }),
          }
        );

        if (response.status === 200) {
          const updatedMessage = messages.find(
            (message) => message._id === messageId
          );
          const updatedData = await response.json();

          updatedMessage.likeReactions = updatedData.likeReactions;
          updatedMessage.loveReactions = updatedData.loveReactions;
          updatedMessage.dislikeReactions = updatedData.dislikeReactions;
          updatedMessage.angryReactions = updatedData.angryReactions;

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
        const response = await fetch(`${BASE_URL}/messages/${messageId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: editedText, username: username }),
        });

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
            Squeals Pubblici
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
                  ? customPublicMessage ||
                    "Al momento non ci sono Squeals pubblici da mostrare."
                  : customPrivateMessage || "Non hai messaggi privati."}
              </p>
              {viewMode === "public" && !customPublicMessage && (
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

Squeals.propTypes = {
  searchType: PropTypes.string,
  searchText: PropTypes.string,
};

export default Squeals;
