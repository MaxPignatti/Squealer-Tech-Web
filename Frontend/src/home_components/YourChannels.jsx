import React, { useState, useEffect } from "react";
import Cookies from 'js-cookie';

const YourChannels = (channelUpdated) => {
  const [userChannels, setUserChannels] = useState([]);
  const [channelDeleted, setChannelDeleted] = useState(null); // Nuovo stato per gestire l'eliminazione

  useEffect(() => {
    const userDataCookie = Cookies.get('user_data');
    if (userDataCookie) {
      const userData = JSON.parse(userDataCookie);
      const username = userData.username;

      fetch(`http://localhost:3500/channels/created?creator=${username}`)
        .then((response) => response.json())
        .then((data) => setUserChannels(data))
        .catch((error) => console.error("Errore durante il recupero dei canali:", error));
    }
  }, [channelUpdated, channelDeleted]); // Aggiunto channelDeleted come dipendenza

  const handleDeleteChannel = async (channelId) => {
    try {
      const userDataCookie = Cookies.get('user_data');
      if (userDataCookie) {
        const userData = JSON.parse(userDataCookie);
        const username = userData.username;
  
        const response = await fetch(`http://localhost:3500/channels/delete/${channelId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username }),
        });
  
        if (response.status === 200) {
          console.log("Canale eliminato con successo.");
          setChannelDeleted(channelId); // Aggiorna lo stato per riflettere le modifiche
        } else {
          console.error("Errore durante l'eliminazione del canale:", response.status);
        }
      }
    } catch (error) {
      console.error("Errore durante la richiesta di eliminazione:", error);
    }
  };

  return (
    <div>
      <h1 className="display-4">I TUOI CANALI</h1>
      <div className="card">
        <ul className="list-group list-group-flush">
          {userChannels.map((channel) => (
            <li className="list-group-item" key={channel._id}>
              {channel.name}
              <span className="badge bg-primary ms-2">{channel.members.length} Iscritti</span>
              <button
                className="btn btn-danger btn-sm float-end"
                onClick={() => handleDeleteChannel(channel._id)}
              >
                Elimina
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default YourChannels;
