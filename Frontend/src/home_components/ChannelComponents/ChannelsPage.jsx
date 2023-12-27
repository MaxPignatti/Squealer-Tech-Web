import React, { useState } from "react";
import CreateChannel from "./CreateChannel";
import YourChannels from "./YourChannels";
import SubscribedChannels from "./SubscribedChannels";
import AllChannels from "./AllChannels";

const ChannelsPage = () => {
  const [channelUpdated, setChannelUpdated] = useState(false);
  const [subscribedChannelsUpdated, setSubscribedChannelsUpdated] = useState(false);
  const [allChannelsUpdated, setAllChannelsUpdated] = useState(false);

  const handleChannelSubscribed = () => {
    setSubscribedChannelsUpdated((prev) => !prev);
  };

  const handleYourChannelsUpdated = () => {
    setChannelUpdated((prev) => !prev);
  };

  const handleAllChannelsUpdated = () => {
    setAllChannelsUpdated((prev) => !prev);
  };

  const handleSubscribeNewChannel = (channelId) => {
    // Aggiorna SubscribedChannels con il nuovo canale
    setSubscribedChannelsUpdated((prev) => !prev);
    // Rimuovi il canale da AllChannels
    setAllChannelsUpdated((prev) => !prev);
  };

  const handleUnsubscribeChannel = (channelId) => {
    // Aggiorna AllChannels con il canale disiscritto
    setAllChannelsUpdated((prev) => !prev);
  };

  return (
    <div>
      <CreateChannel
        onChannelSubscribed={handleChannelSubscribed}
        onYourChannelsUpdated={handleYourChannelsUpdated}
        onAllChannelsUpdated={handleAllChannelsUpdated}
      />
      <YourChannels channelUpdated={channelUpdated} onChannelUnsubscribed={handleChannelSubscribed} />
      <SubscribedChannels
        subscribedChannelsUpdated={subscribedChannelsUpdated}
        onUnsubscribeChannel={handleUnsubscribeChannel}
      />
      <AllChannels handleSubscribeNewChannel={handleSubscribeNewChannel} allChannelsUpdated={allChannelsUpdated} />
    </div>
  );
};

export default ChannelsPage;
