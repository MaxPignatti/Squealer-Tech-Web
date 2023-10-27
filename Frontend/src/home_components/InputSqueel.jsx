import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import Cookies from 'js-cookie';

const InputSqueel = () => {
  const [message, setMessage] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleAttachImage = () => {
    setShowImageInput(true);
  };

  const handleConfirmImage = () => {
    setShowImageInput(false);
    setImagePreview(`data:image;base64,${image}`);
  };
  

  const handleImageInputChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
  
    reader.onload = (e) => {
      const base64String = e.target.result.split(',')[1]; // Rimuove il prefisso "data:image/jpeg;base64,"
      setImage(base64String);
    };
  
    reader.readAsDataURL(file);
  };

  const handlePublish = async () => {
    const savedMessage = message;
    const savedMessageLength = message.length;

    setMessage('');
    setImage(null);
    setImagePreview(null);

    const userDataCookie = Cookies.get('user_data');
    if (userDataCookie) {
      try {
        const userData = JSON.parse(userDataCookie);
        const data = {
          userName: userData.username,
          image: (image !== null) ? image : null,
          text: savedMessage,
          charCount: savedMessageLength
        };

        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        };

        const response = await fetch('http://localhost:3500/create', requestOptions);

        if (response.status === 201) {
          const data = await response.json();
          console.log('Messaggio creato:', data);
        } else {
          const data = await response.json();
          console.error('Errore 1 nella creazione del messaggio:', data.error);
        }
      } catch (error) {
        console.error('Errore 2 nella creazione del messaggio:', error);
      }
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
      <Button variant="primary" onClick={handleAttachImage}>
        Allega Foto
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
                src={`data:image;base64,${image}`}
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
      <Button variant="success" onClick={handlePublish}>
        Pubblica
      </Button>
    </div>
  );
};

export default InputSqueel;
