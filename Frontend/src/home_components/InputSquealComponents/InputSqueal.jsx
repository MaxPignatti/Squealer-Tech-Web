import React, { useState, useEffect } from "react";
import { Container, Form } from "react-bootstrap";
import Cookies from "js-cookie";
import CharCounter from "./CharCounter";
import ImageUploader from "./ImageUploader";
import LocationSharer from "./LocationSharer";
import MessageInput from "./MessageInput";
import PublishButton from "./PublishButton";
import RecipientSelector from "./RecipientSelector";
import TemporaryMessageOptions from "./TemporaryMessageOptions";
import LinkInserter from "./LinkInserter";
import {
  handleMessageChange,
  handleImageChange,
  handleRemoveImage,
  toggleMap,
  handleTextSelect,
  handleInsertLink,
} from "./commonFunction";
import { BASE_URL } from "../../config";

const InputSqueal = () => {
  //USE STATE DA ORDINARE
  const [message, setMessage] = useState("");
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [dailyCharacters, setDailyCharacters] = useState(0);
  const [weeklyCharacters, setWeeklyCharacters] = useState(0);
  const [monthlyCharacters, setMonthlyCharacters] = useState(0);
  const [initialDailyCharacters, setInitialDailyCharacters] = useState(0);
  const [initialWeeklyCharacters, setInitialWeeklyCharacters] = useState(0);
  const [initialMonthlyCharacters, setInitialMonthlyCharacters] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const [publicMessage, setPublicMessage] = useState(false);
  const [isTemp, setIsTemp] = useState(false);
  const [updateInterval, setUpdateInterval] = useState(0);
  const [maxSendCount, setMaxSendCount] = useState(0);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [showMap, setShowMap] = useState(false);

  const [recipientType, setRecipientType] = useState("user");
  const [filteredChannels, setFilteredChannels] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [channels, setChannels] = useState([]);
  const [selectedChannels, setSelectedChannels] = useState([]);

  const [filteredUsers, setFilteredUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [image, setImage] = useState(null); // Stato per l'immagine in base64
  const [imagePreview, setImagePreview] = useState(null); // Stato per l'anteprima dell'immagine
  const [liveLocationEnabled, setLiveLocationEnabled] = useState(false);

  //USE EFFECT
  useEffect(() => {
    const userDataCookie = Cookies.get("user_data");
    if (userDataCookie) {
      const userData = JSON.parse(userDataCookie);
      const username = userData.username;

      fetch(`${BASE_URL}/users/${username}/subscribedChannels`)
        .then((response) => response.json())
        .then((data) => {
          const nonModeratorChannels = data.filter(
            (channel) => !channel.moderatorChannel
          );
          setChannels(nonModeratorChannels);
        })
        .catch((error) =>
          console.error("Errore durante il recupero dei canali:", error)
        );

      fetch(`${BASE_URL}/usr`)
        .then((response) => response.json())
        .then((data) => setUsers(data))
        .catch((error) =>
          console.error("Errore durante il recupero degli utenti:", error)
        );
    }
  }, []);

  useEffect(() => {
    const userDataCookie = Cookies.get("user_data");
    if (userDataCookie) {
      const userData = JSON.parse(userDataCookie);
      const username = userData.username;

      fetch(`${BASE_URL}/usr/${username}`)
        .then((response) => {
          if (response.status === 200) {
            return response.json();
          } else {
            throw new Error("API call failed");
          }
        })
        .then((data) => {
          setDailyCharacters(data.dailyChars);
          setWeeklyCharacters(data.weeklyChars);
          setMonthlyCharacters(data.monthlyChars);
          setInitialDailyCharacters(data.dailyChars);
          setInitialWeeklyCharacters(data.weeklyChars);
          setInitialMonthlyCharacters(data.monthlyChars);
        })
        .catch((error) => {
          console.error("API call error:", error);
        });
    } else {
      console.error("User data not found in cookies");
    }
  }, []);

  useEffect(() => {
    if (selectedChannels.length === 0) {
      setPublicMessage(false);
    } else if (!publicMessage) {
      setPublicMessage(true);
    }
  }, [selectedChannels]);

  useEffect(() => {
    if (publicMessage) {
      const charCounter =
        (currentLocation != null) * 125 +
        (image != null) * 125 +
        message.length;
      if (
        charCounter <= initialDailyCharacters &&
        charCounter <= initialWeeklyCharacters &&
        charCounter <= initialMonthlyCharacters
      ) {
        setDailyCharacters(initialDailyCharacters - charCounter);
        setWeeklyCharacters(initialWeeklyCharacters - charCounter);
        setMonthlyCharacters(initialMonthlyCharacters - charCounter);
      } else {
        setSelectedChannels([]);
        alert("Not enough characters to send your message (to a channel)");
      }
    } else {
      setDailyCharacters(initialDailyCharacters);
      setWeeklyCharacters(initialWeeklyCharacters);
      setMonthlyCharacters(initialMonthlyCharacters);
    }
  }, [publicMessage]);

  useEffect(() => {
    if (recipientType === "channel") {
      const filtered = channels
        .filter((channel) =>
          channel.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 5); // Limita a 5 canali
      setFilteredChannels(filtered);
    } else if (recipientType === "user") {
      const filtered = users
        .filter((user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 5); // Limita a 5 utenti
      setFilteredUsers(filtered);
    }
  }, [searchTerm, channels, users, recipientType]);

  //FUNZIONI PER DESTINATARI
  const handleRecipientChange = (newValue) => {
    setRecipientType(newValue);
  };

  const handleSearchChange = (event) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);

    if (recipientType === "user") {
      // Filtra gli utenti in base al termine di ricerca
      const filtered = users.filter((user) =>
        user.username.toLowerCase().includes(newSearchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else if (recipientType === "channel") {
      // Filtra i canali in base al termine di ricerca
      const filtered = channels.filter((channel) =>
        channel.name.toLowerCase().includes(newSearchTerm.toLowerCase())
      );
      setFilteredChannels(filtered);
    }
  };

  const handleUserSelect = (newUser) => {
    if (!selectedUsers.some((user) => user._id === newUser._id)) {
      setSelectedUsers([...selectedUsers, newUser]);
    }
  };

  const handleChannelSelect = (newChannel) => {
    if (!selectedChannels.some((channel) => channel._id === newChannel._id)) {
      setSelectedChannels([...selectedChannels, newChannel]);
    }
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter((user) => user._id !== userId));
  };

  const handleRemoveChannel = (channelId) => {
    setSelectedChannels(
      selectedChannels.filter((channel) => channel._id !== channelId)
    );
  };

  //FUNZIONI PER MESSAGGI TEMPORANEI
  const toggleTemp = () => {
    setIsTemp(!isTemp);
    if (!isTemp) {
      setUpdateInterval("");
      setMaxSendCount("");
    }
  };

  const handleUpdateIntervalChange = (e) => {
    const value = e.target.value;
    if (/^\d+$/.test(value)) {
      const numericValue = parseInt(value);
      if (numericValue >= 1 && numericValue <= 15) {
        setUpdateInterval(numericValue);
      } else {
        setUpdateInterval(numericValue < 1 ? 1 : 60);
      }
    }
  };

  const handleMaxSendCountChange = (e) => {
    const value = e.target.value;
    if (/^\d+$/.test(value)) {
      const numericValue = parseInt(value);
      if (numericValue >= 1 && numericValue <= 20) {
        setMaxSendCount(numericValue);
      } else {
        setMaxSendCount(numericValue < 1 ? 1 : 20);
      }
    }
  };

  const validatePublishData = (message, selectedChannels, selectedUsers) => {
    if (!message) return "Scrivi qualcosa";
    if (selectedChannels.length === 0 && selectedUsers.length === 0)
      return "Seleziona un destinatario";
    return "";
  };

  const preparePublishData = ({
    userData,
    message,
    image,
    dailyCharacters,
    weeklyCharacters,
    monthlyCharacters,
    updateInterval,
    maxSendCount,
    currentLocation,
    selectedChannels,
    selectedUsers,
  }) => {
    const currentTime = new Date();
    const isTempMessage = updateInterval && maxSendCount;

    return {
      userName: userData.username,
      image: image || null,
      text: message,
      dailyCharacters,
      weeklyCharacters,
      monthlyCharacters,
      updateInterval: isTempMessage ? updateInterval : undefined,
      maxSendCount: isTempMessage ? maxSendCount : undefined,
      nextSendTime: isTempMessage
        ? new Date(currentTime.getTime() + updateInterval * 60000)
        : undefined,
      location: currentLocation
        ? [currentLocation[0], currentLocation[1]]
        : null,
      recipients: {
        channels: selectedChannels.map((channel) => channel.name),
        users: selectedUsers.map((user) => user.username),
      },
      isLive: liveLocationEnabled,
    };
  };

  const publishMessage = async (requestData) => {
    const url = `${BASE_URL}/messages`;
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    };

    const response = await fetch(url, requestOptions);
    return response;
  };

  const handlePublish = async () => {
    const userDataCookie = Cookies.get("user_data");
    if (!userDataCookie) {
      console.error("User data not found in cookies");
      return;
    }

    const errorMessage = validatePublishData(
      message,
      selectedChannels,
      selectedUsers
    );
    if (errorMessage) {
      setErrorMessage(errorMessage);
      return;
    }
    try {
      const userData = JSON.parse(userDataCookie);
      const requestData = preparePublishData({
        userData,
        message,
        image,
        dailyCharacters,
        weeklyCharacters,
        monthlyCharacters,
        updateInterval,
        maxSendCount,
        currentLocation,
        selectedChannels,
        selectedUsers,
      });

      const response = await publishMessage(requestData);
      if (response.status === 201) {
        window.location.reload();
      } else {
        const data = await response.json();
        console.error("Errore nella creazione del messaggio:", data.error);
      }
    } catch (error) {
      console.error("Errore nella creazione del messaggio:", error);
    }
  };

  return (
    <Container>
      <Form>
        <div className="mb-3">
          {" "}
          <RecipientSelector
            recipientType={recipientType}
            handleRecipientChange={handleRecipientChange}
            searchTerm={searchTerm}
            handleSearchChange={handleSearchChange}
            filteredChannels={filteredChannels}
            filteredUsers={filteredUsers}
            handleUserSelect={handleUserSelect}
            handleChannelSelect={handleChannelSelect}
            selectedUsers={selectedUsers}
            selectedChannels={selectedChannels}
            handleRemoveUser={handleRemoveUser}
            handleRemoveChannel={handleRemoveChannel}
          />
          <hr />
        </div>
        <MessageInput
          message={message}
          handleMessageChange={(event) =>
            handleMessageChange(
              event,
              setMessage,
              setDailyCharacters,
              setWeeklyCharacters,
              setMonthlyCharacters,
              currentLocation,
              image,
              publicMessage,
              initialDailyCharacters,
              initialWeeklyCharacters,
              initialMonthlyCharacters
            )
          }
          handleTextSelect={(e) => handleTextSelect(e, setSelection)}
        />
        <LinkInserter
          handleInsertLink={(url) =>
            handleInsertLink(url, selection, message, setMessage)
          }
          selection={selection}
        />

        <ImageUploader
          image={image}
          imagePreview={imagePreview}
          handleImageChange={(e) =>
            handleImageChange(
              e,
              setImage,
              setImagePreview,
              setDailyCharacters,
              setWeeklyCharacters,
              setMonthlyCharacters,
              dailyCharacters,
              weeklyCharacters,
              monthlyCharacters,
              publicMessage
            )
          }
          handleRemoveImage={() =>
            handleRemoveImage(
              setImage,
              setImagePreview,
              setDailyCharacters,
              setWeeklyCharacters,
              setMonthlyCharacters,
              publicMessage,
              dailyCharacters,
              weeklyCharacters,
              monthlyCharacters
            )
          }
        />
        <LocationSharer
          showMap={showMap}
          toggleMap={() =>
            toggleMap(
              showMap,
              setShowMap,
              setCurrentLocation,
              setDailyCharacters,
              setWeeklyCharacters,
              setMonthlyCharacters,
              publicMessage,
              dailyCharacters,
              weeklyCharacters,
              monthlyCharacters
            )
          }
        />
        <TemporaryMessageOptions
          isTemp={isTemp}
          toggleTemp={toggleTemp}
          updateInterval={updateInterval}
          handleUpdateIntervalChange={handleUpdateIntervalChange}
          maxSendCount={maxSendCount}
          handleMaxSendCountChange={handleMaxSendCountChange}
        />
        {isTemp && currentLocation && (
          <div className="mb-3">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setLiveLocationEnabled(!liveLocationEnabled)}
            >
              {liveLocationEnabled
                ? "Disabilita Posizione Live"
                : "Abilita Posizione Live"}
            </button>
          </div>
        )}
      </Form>
      <CharCounter
        dailyCharacters={dailyCharacters}
        weeklyCharacters={weeklyCharacters}
        monthlyCharacters={monthlyCharacters}
      />
      <PublishButton
        handlePublish={handlePublish}
        liveLocationEnabled={liveLocationEnabled}
      />
      {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
    </Container>
  );
};

export default InputSqueal;
