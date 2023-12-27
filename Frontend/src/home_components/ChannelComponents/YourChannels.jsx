import React, { useState, useEffect } from "react";
import Cookies from 'js-cookie';

const YourChannels = ({ channelUpdated, onChannelUnsubscribed }) => {
  const [userChannels, setUserChannels] = useState([]);
  const [channelDeleted, setChannelDeleted] = useState(null);
  const [membersList, setMembersList] = useState([]);
  const [selectedChannelId, setSelectedChannelId] = useState(null);

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
  }, [channelUpdated, channelDeleted]);

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

          // Aggiorna lo stato per riflettere le modifiche
          setChannelDeleted(channelId);
          // Richiedi nuovamente l'elenco aggiornato dei canali a cui sei iscritto
          onChannelUnsubscribed();
        } else {
          console.error("Errore durante l'eliminazione del canale:", response.status);
        }
      }
    } catch (error) {
      console.error("Errore durante la richiesta di eliminazione:", error);
    }
  };

  const handleShowMembers = async (members, channelId) => {
      setMembersList(members);
      setSelectedChannelId(channelId);
  };

  const handleRemoveMember = async (username) => {
    try {
      console.log(selectedChannelId)
      const response = await fetch(`http://localhost:3500/channels/removeMember/${selectedChannelId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });
      if (response.status === 200) {
        console.log("Membro rimosso con successo.");
        setMembersList((prevMembers) => prevMembers.filter((member) => member !== username));
      } else {
        console.error("Errore durante la rimozione del membro dal canale:", response.status);
      }
    } catch (error) {
      console.error("Errore durante la richiesta di rimozione del membro dal canale:", error);
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
              <span
                className="badge bg-primary ms-2"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  if (selectedChannelId === channel._id) {
                    setSelectedChannelId(null); // Nascondi l'elenco
                  } else {
                    handleShowMembers(channel.members, channel._id); // Mostra l'elenco
                  }
                }}
              >
                {channel.members.length} Iscritti
              </span>
              <button
                className="btn btn-danger btn-sm float-end"
                onClick={() => handleDeleteChannel(channel._id)}
              >
                Elimina
              </button>
              {selectedChannelId === channel._id && (
                <ul className="list-group mt-2">
                  {membersList.map((member) => (
                    <li className="list-group-item" key={member}>
                      {member}
                      <button
                        className="btn btn-danger btn-sm float-end"
                        onClick={() => handleRemoveMember(member)}
                      >
                        Rimuovi
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default YourChannels;