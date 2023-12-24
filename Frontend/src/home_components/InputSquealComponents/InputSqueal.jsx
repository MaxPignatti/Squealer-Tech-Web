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

const InputSqueel = () => {
  const [charLimit, setCharLimit]=useState(null);
  const [message, setMessage] = useState('');
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [showImageInput, setShowImageInput] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const [photoUploaded, setPhotoUploaded] = useState(false);

  const [isTemp, setIsTemp] = useState(false);
  const [updateInterval, setUpdateInterval] = useState(0);
  const [maxSendCount, setMaxSendCount] = useState(0);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const [recipientType, setRecipientType] = useState('user');
  const [filteredChannels, setFilteredChannels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [channels, setChannels] = useState([]);
  const [selectedChannels, setSelectedChannels] = useState([]);

  const [filteredUsers, setFilteredUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);


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

  const handleRecipientChange = (event) => {
    setRecipientType(event.target.value);
  };

// Funzione per gestire la selezione multipla di canali
const handleChannelSelect = (channel) => {
  if (!selectedChannels.some(selectedChannel => selectedChannel._id === channel._id)) {
    setSelectedChannels(prev => [...prev, channel]);
  } else {
    console.log("Canale già selezionato:", channel.name);
  }
};

const handleRecipientSelect = (recipient) => {
  if (recipient.type === 'user') {
    // Aggiungi l'utente selezionato se non è già presente nell'elenco
    if (!selectedUsers.some(user => user.id === recipient.id)) {
      setSelectedUsers([...selectedUsers, recipient]);
    }
  } else if (recipient.type === 'channel') {
    // Aggiungi il canale selezionato se non è già presente nell'elenco
    if (!selectedChannels.some(channel => channel.id === recipient.id)) {
      setSelectedChannels([...selectedChannels, recipient]);
    }
  }
};

  const handleInputChange = (e) => {
    const inputMessage = e.target.value;
    if (inputMessage.length <= charLimit - photoUploaded*50) {
      setMessage(inputMessage);
      let remainingChars = charLimit - inputMessage.length;
      if (photoUploaded) {
        remainingChars -= 50;
      }
      setCharCount(remainingChars);
    }
  };

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };


  const handleTextSelect = (e) => {
    setSelection({ start: e.target.selectionStart, end: e.target.selectionEnd });
  };

  const handleInsertLink = () => {
    const url = prompt("Inserisci l'URL del link:");
    if (url && selection.start !== selection.end) {
      const beforeText = message.substring(0, selection.start);
      const linkText = message.substring(selection.start, selection.end);
      const afterText = message.substring(selection.end);
      setMessage(`${beforeText}[${linkText}](${url})${afterText}`);
    } else {
      alert("Per favore, seleziona del testo nel messaggio per linkarlo.");
    }
  };
  
  const toggleTemp = () => {
    setIsTemp(!isTemp);
  };

  const toggleMap = () => {
    setShowMap(!showMap);
  };

  const handleSearchChange = (event) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);

    if (recipientType === 'user') {
      // Filtra gli utenti in base al termine di ricerca
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(newSearchTerm.toLowerCase())
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

  const handleAttachImage = () => {
      if (charCount >= 50) {
        const handleAttachImage = () => {
          setShowImageInput(!showImageInput);
          if (!showImageInput) {
            setPhotoUploaded(true);
            setCharCount(charCount - 50); // Rimuovi 50 caratteri per la foto
          } else {
            setPhotoUploaded(false);
            setCharCount(charCount + 50); // Aggiungi 50 caratteri se la foto viene rimossa
          }
        };
      } else {
        alert('Not enough characters for an image upload.');
      }
  };
  
  const handleToggleTemp = () => {
    setIsTemp(!isTemp);
    if (!isTemp) {
      setUpdateInterval('');
      setMaxSendCount('');
    }
  }; 
  const handleIntervalChange = (e) => {
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
  
  const handleUpdateIntervalChange = (event) => {
    const newInterval = event.target.value;

    // Valida l'input per assicurarti che sia un numero e che soddisfi i tuoi criteri
    if (!isNaN(newInterval) && newInterval >= 1 && newInterval <= 60) {
      setUpdateInterval(newInterval);
    } else {
      // Gestisci il caso in cui l'input non sia valido
      console.log("Intervallo non valido. Deve essere un numero tra 1 e 60.");
    }
  };

  const handleConfirmInterval = () => {
    setIsTemp(false); 
  };
  
  const toggleImageInput = () => {
    setShowImageInput(!showImageInput);
  };

  const handleImageInputChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
  
    reader.onload = (e) => {
      const base64String = e.target.result; 
      setImage(base64String);
    };
  
    reader.readAsDataURL(file);
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
  
  const handleCloseMap = () => {
    setShowMap(false);
    setCurrentLocation(null);
    setCharCount(charCount + 50); // Aggiungi 30 caratteri se la posizione viene rimossa
  };

  const handleGetLocation = () => {
    setShowMap(true);
    if(charCount >= 50)
      setCharCount(charCount - 50);
    else {
      alert('Not enough characters for a position upload.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (latitude != null && longitude != null) {
          setCurrentLocation([latitude, longitude]);
          //console.log([latitude, longitude]);
        } else {
          console.error('Invalid coordinates received');
        }
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );
  };
  

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
        handleRecipientSelect={handleRecipientSelect}
      />
      <MessageInput
        message={message}
        handleMessageChange={handleMessageChange}
      />
      <CharCounter charCount={charCount} />
      <ImageUploader
        showImageInput={showImageInput}
        toggleImageInput={toggleImageInput}
        imagePreview={imagePreview}
      />
      <LocationSharer
        showMap={showMap}
        toggleMap={toggleMap}
        currentLocation={currentLocation}
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