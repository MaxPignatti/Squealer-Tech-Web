import React, { useState } from "react";
import Cookies from 'js-cookie';

const CreateChannel = ({ onChannelSubscribed, onYourChannelsUpdated, onAllChannelsUpdated }) => {
  const [showForm, setShowForm] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [channelDescription, setChannelDescription] = useState("");

  const handleCreateChannel = async () => {
    const userDataCookie = Cookies.get('user_data');
    if (userDataCookie) {
      const userData = JSON.parse(userDataCookie);
      const username = userData.username;
      try {
        const response = await fetch("http://localhost:3500/channels", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: channelName,
            description: channelDescription,
            creator: username,
          }),
        });

        if (response.status === 201) {
          console.log("Canale creato con successo.");
          setShowForm(false);

          // Aggiorna ChannelsPage quando viene creato un nuovo canale
          onYourChannelsUpdated();
          // Aggiorna SubscribedChannels quando viene creato un nuovo canale
          onChannelSubscribed();
          // Aggiorna AllChannels quando viene creato un nuovo canale
          onAllChannelsUpdated();
        } else {
          console.error("Errore durante la creazione del canale:", response.status);
        }
      } catch (error) {
        console.error("Errore durante la richiesta POST:", error);
      }
    } else {
      console.error('User data not found in cookies');
    }
  };

  return (
    <div className="create-channel">
      <button
        className="btn btn-primary mt-3"
        onClick={() => setShowForm(true)}
      >
        Crea nuovo canale
      </button>

      {showForm && (
        <div className="mt-3">
          <h2>Crea un nuovo canale</h2>
          <div className="mb-3">
            <label htmlFor="channelName" className="form-label">Nome del canale</label>
            <input
              type="text"
              className="form-control"
              id="channelName"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="channelDescription" className="form-label">Descrizione del canale</label>
            <input
              type="text"
              className="form-control"
              id="channelDescription"
              value={channelDescription}
              onChange={(e) => setChannelDescription(e.target.value)}
            />
          </div>
          <button
            className="btn btn-success"
            onClick={handleCreateChannel}
          >
            Crea canale
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateChannel;