import React, { useState, useEffect } from "react";
import Cookies from 'js-cookie';

const AllChannels = ({ handleSubscribeNewChannel }) => {
  const [allChannels, setAllChannels] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredChannels, setFilteredChannels] = useState([]);

  useEffect(() => {
    const userDataCookie = Cookies.get('user_data');
    if (userDataCookie) {
      const userData = JSON.parse(userDataCookie);
      const username = userData.username;

      fetch(`http://localhost:3500/channels/all/${username}`)
        .then((response) => response.json())
        .then((data) => setAllChannels(data))
        .catch((error) => console.error("Errore durante il recupero di tutti i canali:", error));
    }
  }, []);

  useEffect(() => {
    // Filtra i canali in base al termine di ricerca
    const filtered = allChannels.filter(channel => channel.name.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredChannels(filtered);
  }, [searchTerm, allChannels]);

  const handleSubscribe = async (channelId) => {
    try {
      const userDataCookie = Cookies.get('user_data');
      if (userDataCookie) {
        const userData = JSON.parse(userDataCookie);
        const username = userData.username;

        const response = await fetch(`http://localhost:3500/channels/subscribe/${channelId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username }),
        });

        if (response.status === 200) {
          console.log("Iscrizione avvenuta con successo.");
          // Rimuovi il canale dalla lista di AllChannels
          setAllChannels(prevChannels => prevChannels.filter(channel => channel._id !== channelId));
          // Chiamiamo la funzione per aggiungere il nuovo canale agli iscritti
          handleSubscribeNewChannel(channelId);
        } else {
          console.error("Errore durante l'iscrizione:", response.status);
        }
      }
    } catch (error) {
      console.error("Errore durante la richiesta di iscrizione:", error);
    }
  };

  return (
    <div>
      <h1 className="display-4">TUTTI I CANALI</h1>
      <div className="mb-3">
        <label htmlFor="searchTerm" className="form-label">Cerca canale</label>
        <input
          type="text"
          className="form-control"
          id="searchTerm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="card">
        <ul className="list-group list-group-flush">
          {filteredChannels.map((channel) => (
            <li className="list-group-item" key={channel._id}>
              {channel.name}
              <span className="badge bg-primary ms-2">{channel.members.length} Iscritti</span>
              <button
                className="btn btn-success btn-sm float-end"
                onClick={() => handleSubscribe(channel._id)}
              >
                Iscriviti
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AllChannels;