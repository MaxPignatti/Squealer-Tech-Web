import React, { useState, useEffect } from "react";
import { Button } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Cookies from 'js-cookie';
import CharCounter from './CharCounter';
import ImageUploader from './ImageUploader';
import LocationSharer from './LocationSharer';
import MessageInput from './MessageInput';
import PublishButton from './PublishButton';
import RecipientSelector from './RecipientSelector';
import TemporaryMessageOptions from './TemporaryMessageOptions';
import LinkInserter from './LinkInserter';
const InputSqueel = () => {

  //USE STATE DA ORDINARE
  const [charLimit, setCharLimit]=useState(null);
  const [message, setMessage] = useState('');
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [charCount, setCharCount] = useState(0);

  const [isTemp, setIsTemp] = useState(false);
  const [updateInterval, setUpdateInterval] = useState(0);
  const [maxSendCount, setMaxSendCount] = useState(0);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [showMap, setShowMap] = useState(false);

  const [recipientType, setRecipientType] = useState('user');
  const [filteredChannels, setFilteredChannels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [channels, setChannels] = useState([]);
  const [selectedChannels, setSelectedChannels] = useState([]);

  const [filteredUsers, setFilteredUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [image, setImage] = useState(null); // Stato per l'immagine in base64
  const [imagePreview, setImagePreview] = useState(null); // Stato per l'anteprima dell'immagine


  //USE EFFECT
  useEffect(() => {
    const userDataCookie = Cookies.get('user_data');
    if (userDataCookie) {
      const userData = JSON.parse(userDataCookie);
      const username = userData.username;

      fetch(`http://localhost:3500/channels/subscribed/${username}`)
        .then((response) => response.json())
        .then((data) => setChannels(data))
        .catch((error) => console.error("Errore durante il recupero dei canali:", error));

      fetch(`http://localhost:3500/usr`)
        .then((response) => response.json())
        .then((data) => setUsers(data)) 
        .catch((error) => console.error("Errore durante il recupero degli utenti:", error));
    }
  }, []);

  useEffect(() => {
    const userDataCookie = Cookies.get('user_data');
    if (userDataCookie) {
      const userData = JSON.parse(userDataCookie);
      const username = userData.username;

      fetch(`http://localhost:3500/usr/${username}`)
        .then((response) => {
          if (response.status === 200) {
            return response.json();
          } else {
            throw new Error('API call failed');
          }
        })
        .then((data) => {
          setCharLimit(data.remChar);
          setCharCount(data.remChar);
        })
        .catch((error) => {
          console.error('API call error:', error);
        });
    } else {
      console.error('User data not found in cookies');
    }
  }, []);

  useEffect(() => {
    if (recipientType === 'channel') {
      const filtered = channels.filter(channel => 
        channel.name.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5); // Limita a 5 canali
      setFilteredChannels(filtered);
    } else if (recipientType === 'user') {
      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5); // Limita a 5 utenti
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

    if (recipientType === 'user') {
      // Filtra gli utenti in base al termine di ricerca
      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(newSearchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else if (recipientType === 'channel') {
      // Filtra i canali in base al termine di ricerca
      const filtered = channels.filter(channel => 
        channel.name.toLowerCase().includes(newSearchTerm.toLowerCase())
      );
      setFilteredChannels(filtered);
    }
  };

  const handleUserSelect = (newUser) => {
      if (!selectedUsers.some(user => user._id === newUser._id)) {
        setSelectedUsers([...selectedUsers, newUser]);
      }
    };
  
  const handleChannelSelect = (newChannel) => {
    console.log(newChannel)
    if (!selectedChannels.some(channel => channel._id === newChannel._id)) {
      setSelectedChannels([...selectedChannels, newChannel]);
    }
  };
  
  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter(user => user._id !== userId));
  };

  const handleRemoveChannel = (channelId) => {
    setSelectedChannels(selectedChannels.filter(channel => channel._id !== channelId));
  };

  //FUNZIONE PER TEXT
  const handleMessageChange = (event) => {
    const inputMessage = event.target.value;
    if (inputMessage.length <= charLimit) {
      setMessage(inputMessage);
      let remainingChars = charLimit - inputMessage.length;
      setCharCount(remainingChars);
    }
  };

  //FUNZIONI PER IMMAGINI
  const handleImageChange = (e) => {
    if(charCount >= 50)
      setCharCount(charCount - 50);
    else {
      alert('Not enough characters for an image upload.');
      return;
    }
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result); // Salva l'immagine in base64
        setImagePreview(event.target.result); // Imposta l'anteprima dell'immagine
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null); // Rimuove l'immagine
    setImagePreview(null); // Rimuove l'anteprima dell'immagine
    setCharCount(charCount + 50);
  };

  //FUNZIONI PER POSIZIONE
  const toggleMap = () => {
    if (showMap) {
      handleCloseMap();
    } else {
      handleGetLocation();
    }
  };

  const handleCloseMap = () => {
    setShowMap(false);
    setCurrentLocation(null);
    setCharCount(charCount + 50);
  };

  const handleGetLocation = () => {
    if(charCount >= 50)
      setCharCount(charCount - 50);
    else {
      alert('Not enough characters for a position upload.');
      return;
    }
    setShowMap(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (latitude != null && longitude != null) {
          setCurrentLocation([latitude, longitude]);
          console.log([latitude, longitude]);
        } else {
          console.error('Invalid coordinates received');
        }
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );
  };
  
   // Gestione della selezione del testo
   const handleTextSelect = (e) => {
    setSelection({ start: e.target.selectionStart, end: e.target.selectionEnd });
  };

  // Funzione per inserire il link nel messaggio
  const handleInsertLink = (url) => {
    if (url && selection.start !== selection.end) {
      const beforeText = message.substring(0, selection.start);
      const linkText = message.substring(selection.start, selection.end);
      const afterText = message.substring(selection.end);
      setMessage(`${beforeText}[${linkText}](${url})${afterText}`);
    } else {
      alert("Per favore, seleziona del testo nel messaggio per linkarlo.");
    }
  };
  
  //FUNZIONI PER MESSAGGI TEMPORANEI
  const toggleTemp = () => {
    setIsTemp(!isTemp);
    if (!isTemp) {
      setUpdateInterval('');
      setMaxSendCount('');
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

  //PUBLISH
  const handlePublish = async () => {
    const savedMessage = message;
    setMessage('');
    setImage(null);
    setImagePreview(null);
  
    if (savedMessage && (selectedChannels.length > 0 || selectedUsers.length > 0)) {
      const userDataCookie = Cookies.get('user_data');
      if (userDataCookie) {
        try {
          const userData = JSON.parse(userDataCookie);
          const currentTime = new Date();
          const isTempMessage = updateInterval && maxSendCount;
          if (isTempMessage && (!updateInterval || !maxSendCount)) {
            alert("Please enter valid update interval and max send count for temporary messages.");
            return;
          }
          console.log(isTempMessage)
          const requestData = {
            userName: userData.username,
            image: image !== null ? image : null,
            text: savedMessage,
            charCount: charCount,
            updateInterval: isTempMessage ? updateInterval : undefined,
            maxSendCount: isTempMessage ? maxSendCount : undefined,
            nextSendTime: isTempMessage ? new Date(currentTime.getTime() + updateInterval * 60000) : undefined,
            location: currentLocation ? { latitude: currentLocation[0], longitude: currentLocation[1] } : null,
            recipients: {
              channels: selectedChannels.map(channel => channel.name), // Presumo che ogni canale abbia un id
              users: selectedUsers.map(user => user.username), // Presumo che ogni utente abbia un id
            },
          };
  
          const url = 'http://localhost:3500/create'; // Esempio di URL per la nuova endpoint
  
          const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData),
          };
  
          const response = await fetch(url, requestOptions);
  
          if (response.status === 201) {
            const data = await response.json();
            window.location.reload();
          } else {
            const data = await response.json();
            console.error('Errore nella creazione del messaggio:', data.error);
          }
        } catch (error) {
          console.error('Errore nella creazione del messaggio:', error);
        }
      }
    } else {
      alert('Devi scrivere qualcosa e selezionare almeno un destinatario');
    }
  };
  
  return (
    <div className="input-squeals-container">
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
      <MessageInput
        message={message}
        handleMessageChange={handleMessageChange}
        handleTextSelect={handleTextSelect}
      />
      <LinkInserter
        handleInsertLink={handleInsertLink}
        selection={selection}
      />
      <CharCounter charCount={charCount} />
      <ImageUploader
        image={image}
        imagePreview={imagePreview}
        handleImageChange={handleImageChange}
        handleRemoveImage={handleRemoveImage}
      />
      <LocationSharer
        showMap={showMap}
        toggleMap={toggleMap}
      />
      <TemporaryMessageOptions
        isTemp={isTemp}
        toggleTemp={toggleTemp}
        updateInterval={updateInterval}
        handleUpdateIntervalChange={handleUpdateIntervalChange}
        maxSendCount={maxSendCount}
        handleMaxSendCountChange={handleMaxSendCountChange}
      />
      <PublishButton handlePublish={handlePublish} />
    </div>
  );
};

export default InputSqueel;