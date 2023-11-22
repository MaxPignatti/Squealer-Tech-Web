import React, { useState, useEffect } from "react";
import { Button } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Cookies from 'js-cookie';

const InputSqueel = () => {
  const [charLimit, setCharLimit]=useState(null);
  const [message, setMessage] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const [photoUploaded, setPhotoUploaded] = useState(false);

  const [isTemp, setIsTemp] = useState(false);
  const [updateInterval, setUpdateInterval] = useState('');
  const [maxSendCount, setMaxSendCount] = useState('');

  const [currentLocation, setCurrentLocation] = useState(null);
  const [showMap, setShowMap] = useState(false);

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

  const handleConfirmImage = () => {
    setPhotoUploaded(true);
    setCharCount(charCount - 50);
    setShowImageInput(false);
    setImagePreview(`${image}`);
  };
  
  const handleToggleTemp = () => {
    setIsTemp(!isTemp);
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
      const base64String = e.target.result; // Rimuove il prefisso "data:image/jpeg;base64,"
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
  
  
  //da finire
  const handleConfirmMap = () => {

    setCharCount(charCount - 50);

  };

  const handlePublish = async () => {
    const savedMessage = message;
    setMessage('');
    setImage(null);
    setImagePreview(null);
    if(savedMessage){
    const userDataCookie = Cookies.get('user_data');
    if (userDataCookie) {
      try {
        console.log('Current Location:', currentLocation);
        const userData = JSON.parse(userDataCookie);
        const data = {
          userName: userData.username,
          image: image !== null ? image : null,
          text: savedMessage,
          charCount: charCount,
          isTemp: isTemp,
          updateInterval: isTemp ? updateInterval : 0,
          maxSendCount: maxSendCount,
          location: currentLocation ? { latitude: currentLocation[0], longitude: currentLocation[1] } : null,
        };
        

        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        };

        const response = await fetch('http://localhost:3500/create', requestOptions);

        if (response.status === 201) {
          const data = await response.json();
          window.location.reload();
        } else {
          const data = await response.json();
          console.error('Errore 1 nella creazione del messaggio:', data.error);
        }
      } catch (error) {
        console.error('Errore 2 nella creazione del messaggio:', error);
      }
    }
  }else{
    alert('You have to write something')
  }
  };
  
  return (
    <div className="input-squeel">
      <input
        type="text"
        value={message}
        onChange={handleInputChange}
        placeholder="Inserisci il tuo messaggio..."
      />
      <small>Caratteri rimanenti: {charCount}</small>
      <Button variant="primary" onClick={handleAttachImage}>
        {showImageInput ? "Annulla Foto" : "Allega Foto"}
      </Button>
      {showImageInput && (
        <>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageInputChange}
          />
          {image && (
            <>
              <img
                src={`${image}`}
                alt="Anteprima"
                style={{ maxWidth: '100%', maxHeight: '100px' }}
              />
              <Button variant="success" onClick={handleConfirmImage}>
                Conferma Foto
              </Button>
            </>
          )}
        </>
      )}
      {imagePreview && (
        <img
          src={imagePreview}
          alt="Anteprima"
          style={{ maxWidth: '100%', maxHeight: '100px' }}
        />
      )}

      <Button variant="warning" onClick={handleGetLocation}>
        Condividi la tua Posizione
      </Button>
      
      {showMap && (
        <div>
          <small>posizione aggiunta</small>
          <Button variant="danger" onClick={handleCloseMap}>
            Annulla
          </Button>
        </div>
      )}


      <Button variant="success" onClick={handlePublish}>
        Pubblica
      </Button>
      <Button variant="info" onClick={handleToggleTemp}>
        {isTemp ? "Cancel Update" : "Set Update"}
      </Button>
      {isTemp && (
        <div>
          <input
            type="number"
            value={updateInterval}
            onChange={handleIntervalChange}
            placeholder="Intervallo Update(minutes)"
          />
          <input
            type="number"
            value={maxSendCount}
            onChange={handleMaxSendCountChange}
            placeholder="Max Send Count"
          />
        </div>
      )}
    </div>
  );
}
  export default InputSqueel;
