import React, { useState } from "react";
import CreateChannel from "./CreateChannel";
import YourChannels from "./YourChannels";

const ChannelsPage = () => {
  const [channelUpdated, setChannelUpdated] = useState(false); // Nuovo stato per gestire l'aggiornamento

  const handleChannelCreated = () => {
    setChannelUpdated(prev => !prev); // Aggiorna lo stato per riflettere le modifiche
  }

  return (
    <div>
      <CreateChannel onChannelCreated={handleChannelCreated} /> {/* Passa la funzione come prop */}
      <YourChannels channelUpdated={channelUpdated} /> {/* Passa lo stato come prop */}
    </div>
  );
};

export default ChannelsPage;
