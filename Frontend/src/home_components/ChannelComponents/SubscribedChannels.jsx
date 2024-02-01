import React, { useEffect } from "react";
import Cookies from "js-cookie";
import { Card, ListGroup, Button } from "react-bootstrap";

const SubscribedChannels = ({
  subscribedChannels,
  setSubscribedChannels,
  setAllChannels,
}) => {
  const listGroupStyle = {
    maxHeight: "142px",
    overflowY: "auto",
  };

  useEffect(() => {
    const userDataCookie = Cookies.get("user_data");
    if (userDataCookie) {
      const userData = JSON.parse(userDataCookie);
      const username = userData.username;

      fetch(`http://localhost:3500/channels/subscribed/${username}`)
        .then((response) => response.json())
        .then((data) => setSubscribedChannels(data))
        .catch((error) =>
          console.error("Errore durante il recupero dei canali:", error)
        );
    }
  }, []);

  const handleUnsubscribe = async (channel) => {
    try {
      const userDataCookie = Cookies.get("user_data");
      if (userDataCookie) {
        const userData = JSON.parse(userDataCookie);
        const username = userData.username;

        const response = await fetch(
          `http://localhost:3500/channels/unsubscribe/${channel._id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username }),
          }
        );

        if (response.status === 200) {
          console.log("Disiscrizione avvenuta con successo.");
          setSubscribedChannels((prevChannels) =>
            prevChannels.filter((chan) => chan._id !== channel._id)
          );
          setAllChannels((prevChannels) => [...prevChannels, channel]);
        } else {
          console.error("Errore durante la disiscrizione:", response.status);
        }
      }
    } catch (error) {
      console.error("Errore durante la richiesta di disiscrizione:", error);
    }
  };

  return (
    <div className="container mt-3">
      <h1 className="display-4 text-center">CANALI A CUI SEI ISCRITTO</h1>
      <Card>
        <ListGroup variant="flush" style={listGroupStyle}>
          {subscribedChannels.map((channel) => (
            <ListGroup.Item key={channel._id}>
              {channel.name}
              <span className="badge bg-primary ms-2">
                {channel.members.length} Iscritti
              </span>
              <Button
                variant="danger"
                size="sm"
                className="float-end"
                onClick={() => handleUnsubscribe(channel)}
              >
                Disiscriviti
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card>
    </div>
  );
};

export default SubscribedChannels;
