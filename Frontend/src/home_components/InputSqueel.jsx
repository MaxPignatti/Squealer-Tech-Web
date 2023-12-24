import React, { useState, useEffect } from "react";
import { Button } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Cookies from 'js-cookie';

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

// Funzione per gestire la selezione multipla di utenti
const handleUserSelect = (user) => {
  if (!selectedUsers.some(selectedUser => selectedUser._id === user._id)) {
    setSelectedUsers(prev => [...prev, user]);
  } else {
    console.log("Utente già selezionato:", user.username);
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
  
  const handleAttachImage = () => {
    if (!photoUploaded) {
      if (charCount >= 50) {
        setShowImageInput(!showImageInput);
        if (!showImageInput) {
          setImage(null);
          setImagePreview(null);
          //setShowDeleteButton(false);
        }
      } else {
        alert('Not enough characters for an image upload.');
      }
    } else {
      alert('You have already inserted a photo.');
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
  
  const handleConfirmInterval = () => {
    setIsTemp(false); 
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
  };

  const handleGetLocation = () => {
    setShowMap(true);
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
  
  const CharCounter = () => (
    <div style={{ textAlign: 'right', marginTop: '10px' }}>
      Caratteri rimanenti: {charCount}
    </div>
  );
  
  return (
    <div className="input-squeel" style={{ padding: '20px', maxWidth: '500px', margin: 'auto' }}>
      {!showOptions ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Button variant="primary" onClick={() => setShowOptions(true)} style={{ width: 'auto' }}>
            Nuovo Squeel
          </Button>
        </div>
      ) : (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '20px', position: 'relative' }}>
          <div style={{ marginBottom: '20px' }}>
            <label>
              <input
                type="radio"
                name="recipientType"
                value="user"
                checked={recipientType === 'user'}
                onChange={handleRecipientChange}
              />
              Utente Singolo
            </label>
            <label style={{ marginLeft: '10px' }}>
              <input
                type="radio"
                name="recipientType"
                value="channel"
                checked={recipientType === 'channel'}
                onChange={handleRecipientChange}
              />
              Canale
            </label>
  
            {recipientType === 'channel' && (
              <div style={{ marginTop: '10px' }}>
                <input
                  type="text"
                  placeholder="Cerca canale..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '10px' }}
                />
                <ul style={{ maxHeight: '150px', overflowY: 'auto', listStyleType: 'none', padding: 0 }}>
                  {filteredChannels.map(channel => (
                    <li key={channel._id} style={{ padding: '10px', cursor: 'pointer' }} onClick={() => handleChannelSelect(channel)}>
                      {channel.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
  
            {recipientType === 'user' && (
              <div style={{ marginTop: '10px' }}>
                <input
                  type="text"
                  placeholder="Cerca utente..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '10px' }}
                />
                <ul style={{ maxHeight: '150px', overflowY: 'auto', listStyleType: 'none', padding: 0 }}>
                  {filteredUsers.map(user => (
                    <li key={user._id} style={{ padding: '10px', cursor: 'pointer' }} onClick={() => handleUserSelect(user)}>
                      {user.username}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
  
          {selectedChannels.map(channel => (
            <div key={channel._id} style={{ padding: '5px', margin: '5px', display: 'inline-flex', alignItems: 'center', border: '1px solid grey', borderRadius: '10px' }}>
              {channel.name}
              <button
                onClick={() => setSelectedChannels(selectedChannels.filter(c => c._id !== channel._id))}
                className="btn btn-danger btn-sm"
                style={{ marginLeft: '5px', borderRadius: '50%' }}
              >
                &times;
              </button>
            </div>
          ))}
  
          {selectedUsers.map(user => (
            <div key={user._id} style={{ padding: '5px', margin: '5px', display: 'inline-flex', alignItems: 'center', border: '1px solid grey', borderRadius: '10px' }}>
              {user.username}
              <button
                onClick={() => setSelectedUsers(selectedUsers.filter(u => u._id !== user._id))}
                className="btn btn-danger btn-sm"
                style={{ marginLeft: '5px', borderRadius: '50%' }}
              >
                &times;
              </button>
            </div>
          ))}
  
          <textarea
            value={message}
            onChange={handleInputChange}
            onSelect={handleTextSelect}
            placeholder="Inserisci il tuo messaggio..."
            style={{ width: '100%', padding: '10px', marginBottom: '10px', height: '100px' }}
          />
          <CharCounter />
          <Button variant="secondary" onClick={handleInsertLink} style={{ marginBottom: '10px' }}>
            Linka il Testo Selezionato
          </Button>
          <Button variant="primary" onClick={handleAttachImage} style={{ marginBottom: '10px', marginRight: '10px' }}>
            {showImageInput ? "Annulla Foto" : "Allega Foto"}
          </Button>
          {showImageInput && (
            <input
              type="file"
              accept="image/*"
              onChange={handleImageInputChange}
              style={{ display: 'block', marginBottom: '10px' }}
            />
          )}
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Anteprima"
              style={{ maxWidth: '100%', maxHeight: '100px', marginBottom: '10px' }}
            />
          )}
          <Button variant="warning" onClick={handleGetLocation} style={{ marginBottom: '10px', marginRight: '10px' }}>
            Condividi la tua Posizione
          </Button>
  
          {showMap && (
            <div style={{ marginTop: '10px' }}>
              <small style={{ display: 'block', marginBottom: '10px' }}>Posizione aggiunta</small>
              <Button variant="danger" onClick={handleCloseMap}>
                Annulla
              </Button>
            </div>
          )}
  
          <div style={{ marginTop: '20px' }}>
            <Button variant="info" onClick={handleToggleTemp}>
              {isTemp ? "Cancel Update" : "Set Update"}
            </Button>
          </div>
  
          {isTemp && (
            <div style={{ marginTop: '10px' }}>
              <input
                type="number"
                value={updateInterval}
                onChange={handleIntervalChange}
                placeholder="Intervallo Update (minuti)"
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
              />
              <input
                type="number"
                value={maxSendCount}
                onChange={handleMaxSendCountChange}
                placeholder="Max Send Count"
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
              />
            </div>
          )}
  
          <Button variant="danger" onClick={() => setShowOptions(false)} style={{ marginTop: '20px' }}>
            Annulla
          </Button>
          <div style={{ position: 'absolute', right: '20px', bottom: '20px' }}>
            <Button variant="success" onClick={handlePublish}>
              Pubblica
            </Button>
          </div>
        </div>
      )}
    </div>
  );
  

}
  export default InputSqueel;
