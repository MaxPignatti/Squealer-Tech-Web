import React, { useState, useEffect } from "react";
import Cookies from 'js-cookie';

const SubscribedChannels = () => {
  const [subscribedChannels, setSubscribedChannels] = useState([]);

  useEffect(() => {
    const userDataCookie = Cookies.get('user_data');
    if (userDataCookie) {
      const userData = JSON.parse(userDataCookie);
      const username = userData.username;

      fetch(`http://localhost:3500/channels/subscribed/${username}`)
        .then((response) => response.json())
        .then((data) => setSubscribedChannels(data))
        .catch((error) => console.error("Errore durante il recupero dei canali:", error));
    }
  }, []);

  const handleUnsubscribe = async (channelId) => {
    try {
      const userDataCookie = Cookies.get('user_data');
      if (userDataCookie) {
        const userData = JSON.parse(userDataCookie);
        const username = userData.username;

        const response = await fetch(`http://localhost:3500/channels/unsubscribe/${channelId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username }),
        });

        if (response.status === 200) {
          console.log("Disiscrizione avvenuta con successo.");
          const updatedChannels = subscribedChannels.filter(channel => channel._id !== channelId);
          setSubscribedChannels(updatedChannels);
        } else {
          console.error("Errore durante la disiscrizione:", response.status);
        }
      }
    } catch (error) {
      console.error("Errore durante la richiesta di disiscrizione:", error);
    }
  };

  return (
    <div>
      <h1 className="display-4">CANALI A CUI SEI ISCRITTO</h1>
      <div className="card">
        <ul className="list-group list-group-flush">
          {subscribedChannels.map((channel) => (
            <li className="list-group-item" key={channel._id}>
              {channel.name}
              <span className="badge bg-primary ms-2">{channel.members.length} Iscritti</span>
              <button
                className="btn btn-danger btn-sm float-end"
                onClick={() => handleUnsubscribe(channel._id)}
              >
                Disiscriviti
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SubscribedChannels;
