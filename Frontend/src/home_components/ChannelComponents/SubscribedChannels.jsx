import React, { useState, useEffect } from "react";
import Cookies from 'js-cookie';

const SubscribedChannels = ({ subscribedChannels, setSubscribedChannels, setAllChannels }) => {
  

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
  });

  const handleUnsubscribe = async (channel) => {
    try {
      const userDataCookie = Cookies.get('user_data');
      if (userDataCookie) {
        const userData = JSON.parse(userDataCookie);
        const username = userData.username;

        const response = await fetch(`http://localhost:3500/channels/unsubscribe/${channel._id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username }),
        });

        if (response.status === 200) {
          console.log("Disiscrizione avvenuta con successo.");
          setSubscribedChannels(prevChannels => prevChannels.filter(chan => chan._id !== channel._id));
          setAllChannels(prevChannels => [...prevChannels, channel])
          
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
                onClick={() => handleUnsubscribe(channel)}
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
