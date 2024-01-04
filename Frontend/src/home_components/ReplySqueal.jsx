import React, { useState, useEffect } from "react";
import { Button } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Cookies from 'js-cookie';
import CharCounter from './InputSquealComponents/CharCounter';
import ImageUploader from './InputSquealComponents/ImageUploader';
import LocationSharer from './InputSquealComponents/LocationSharer';
import MessageInput from './InputSquealComponents/MessageInput';
import PublishButton from './InputSquealComponents/PublishButton';
import LinkInserter from './InputSquealComponents/LinkInserter';
const ReplySqueal = ({ originalMessage, onStartReplying, onEndReplying }) => {

  //USE STATE DA ORDINARE
  const [message, setMessage] = useState('');
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [dailyCharacters, setDailyCharacters] = useState(0);
  const [weeklyCharacters, setWeeklyCharacters] = useState(0);
  const [monthlyCharacters, setMonthlyCharacters] = useState(0);
  const [initialDailyCharacters, setInitialDailyCharacters] = useState(0);
  const [initialWeeklyCharacters, setInitialWeeklyCharacters] = useState(0);
  const [initialMonthlyCharacters, setInitialMonthlyCharacters] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const [publicMessage, setPublicMessage] = useState(false);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [_id, set_id] = useState(null);


  const [image, setImage] = useState(null); // Stato per l'immagine in base64
  const [imagePreview, setImagePreview] = useState(null); // Stato per l'anteprima dell'immagine


  //USE EFFECT

  useEffect(() => {
    onStartReplying();
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
          setDailyCharacters(data.dailyChars);
          setWeeklyCharacters(data.weeklyChars);
          setMonthlyCharacters(data.monthlyChars);
          setInitialDailyCharacters(data.dailyChars);
          setInitialWeeklyCharacters(data.weeklyChars);
          setInitialMonthlyCharacters(data.monthlyChars);
        })
        .catch((error) => {
          console.error('API call error:', error);
        });
    } else {
      console.error('User data not found in cookies');
    }
    return () => {
      onEndReplying();
    };
  }, []);

  useEffect(() => {
    setPublicMessage(!(originalMessage.channel.length == 0))
  }, []);
  /*
  useEffect(() => {
    const interval = setInterval(() => {
      
      sendLocationPeriodically(_id);
    }, 10000); // Aggiorna ogni 10 secondi

    return () => clearInterval(interval);
  }, []);
  */

  //FUNZIONE PER TEXT
  const handleMessageChange = (event) => {
    const inputMessage = event.target.value;
    const charCounter = (currentLocation != null)*50+(image != null)*50+inputMessage.length;
    if (!publicMessage) {
      setMessage(inputMessage);
    }else if (charCounter <= initialDailyCharacters && charCounter <= initialWeeklyCharacters && charCounter <= initialMonthlyCharacters) {
      setMessage(inputMessage);
      setDailyCharacters(initialDailyCharacters - charCounter);
      setWeeklyCharacters(initialWeeklyCharacters - charCounter);
      setMonthlyCharacters(initialMonthlyCharacters - charCounter);
    }
  };

  //FUNZIONI PER IMMAGINI
  const handleImageChange = (e) => {
    if(publicMessage) {
      if(dailyCharacters >= 50 && weeklyCharacters >= 50 && monthlyCharacters >= 50) {
        setDailyCharacters(dailyCharacters - 50);
        setWeeklyCharacters(weeklyCharacters - 50);
        setMonthlyCharacters(monthlyCharacters - 50);
      }
      else {
        alert('Not enough characters for an image upload.');
        return;
      }
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
    if (publicMessage) {
      setDailyCharacters(dailyCharacters + 50);
      setWeeklyCharacters(weeklyCharacters + 50);
      setMonthlyCharacters(monthlyCharacters + 50);
    }
  };

  //FUNZIONI PER POSIZIONE
  const toggleMap = () => {
    if (showMap) {
      handleCloseMap();
    } else {
      handleOpenMap();
    }
  };

  const handleOpenMap = () => {
    if(publicMessage) {
      if(dailyCharacters >= 50 && weeklyCharacters >= 50 && monthlyCharacters >= 50) {
        setDailyCharacters(dailyCharacters - 50);
        setWeeklyCharacters(weeklyCharacters - 50);
        setMonthlyCharacters(monthlyCharacters - 50);
      }
      else {
        alert('Not enough characters for a position upload.');
        return;
      }
    }
    setShowMap(true);
    handleGetLocation();

  }

  const handleCloseMap = () => {
    setShowMap(false);
    setCurrentLocation(null);
    if (publicMessage) {
      setDailyCharacters(dailyCharacters + 50);
      setWeeklyCharacters(weeklyCharacters + 50);
      setMonthlyCharacters(monthlyCharacters + 50);
    }
  };

  const handleGetLocation = () => {

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (latitude != null && longitude != null) {
          setCurrentLocation([latitude, longitude]);
          //console.log([latitude, longitude], 'acciderbolina!');
        } else {
          console.error('Invalid coordinates received');
        }
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );
  };


  const sendLocationPeriodically = (messageId) => {
    let intervalId; 
  
    intervalId = setInterval(async () => {
      try {
        //console.log('periodically  ok');
        handleGetLocation();
        //console.log(currentLocation);
        sendLocationToBackend(messageId, currentLocation);
      } catch (error) {
        console.error('Error getting current location:', error);
      }
    }, 30000); 
  
    // Interrompi l'intervallo 
    setTimeout(() => {
      clearInterval(intervalId);
      //console.log('Interval stopped after 4 minutes');
    }, 240000);
  };

 
  const sendLocationToBackend = async (messageId, position) => {
    try {
      //console.log('sendbackend ok');
      const response = await fetch(`http://localhost:3500/position/${messageId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ position }),
      });
  
      if (!response.ok) {
        console.error('Failed to update location on the backend');
      }
    } catch (error) {
      console.error('Error sending location to backend:', error);
    }
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
  
    if (savedMessage) {
      const userDataCookie = Cookies.get('user_data');
      setMessage('');
      setImage(null);
      setImagePreview(null);
      setErrorMessage(''); // Reset del messaggio di errore
      if (userDataCookie) {
        try {
          const userData = JSON.parse(userDataCookie);
          const requestData = {
            originalMessageId: originalMessage._id,
            userName: userData.username,
            image: image !== null ? image : null,
            text: savedMessage,
            dailyCharacters: dailyCharacters,
            weeklyCharacters: weeklyCharacters,
            monthlyCharacters: monthlyCharacters,
            location: currentLocation ? { latitude: currentLocation[0], longitude: currentLocation[1] } : null,
          };
  
          const url = 'http://localhost:3500/reply'; 
  
          const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData),
          };
  
          const response = await fetch(url, requestOptions);
          onEndReplying();
          if (response.status === 201) {
            const data = await response.json();
            set_id(data._id);
            window.location.reload();
          } else {
            const data = await response.json();
            console.error('Errore nella creazione della risposta:', data.error);
          }
        } catch (error) {
          console.error('Errore nella creazione della risposta:', error);
        }
      }
    } else {
      setErrorMessage('Scrivi qualcosa');
    }
  };
  
  return (
    <div className="input-squeals-container">
      <MessageInput
        message={message}
        handleMessageChange={handleMessageChange}
        handleTextSelect={handleTextSelect}
      />
      <LinkInserter
        handleInsertLink={handleInsertLink}
        selection={selection}
      />
      <CharCounter 
        dailyCharacters={dailyCharacters}
        weeklyCharacters={weeklyCharacters}
        monthlyCharacters={monthlyCharacters} />
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
      <PublishButton handlePublish={handlePublish} />
      {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
    </div>
  );
};

export default ReplySqueal;