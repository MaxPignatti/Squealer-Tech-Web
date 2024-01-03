import React, { useState } from "react";
import Cookies from 'js-cookie';

const CreateChannel = ({ setSubscribedChannels, setYourChannels }) => {
  const [showForm, setShowForm] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [channelDescription, setChannelDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChannelNameChange = (e) => {
    const name = e.target.value;
    if (name === name.toLowerCase()) {
      setChannelName(name);
      setErrorMessage(""); // Resetta il messaggio di errore se il nome è valido
    } else {
      setErrorMessage("Il nome del canale non può contenere caratteri maiuscoli.");
    }
  };
  
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
          const responseData = await response.json();
          setShowForm(false);
          setSubscribedChannels(prevChannels => [...prevChannels, responseData.newChannel]);
          setYourChannels(prevChannels => [...prevChannels, responseData.newChannel]);
        } else {
          console.error("Errore durante la creazione del canale:", response.status);
        }
      } catch (error) {
        console.error("Errore durante la richiesta POST:", error.message);
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
              onChange={handleChannelNameChange} // Usa la nuova funzione di gestione
            />
            {errorMessage && <div className="text-danger">{errorMessage}</div>} {/* Visualizza il messaggio di errore */}
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
