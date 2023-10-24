import React, { useState } from 'react';
import { Button } from 'react-bootstrap';

const InputSqueel = () => {
  const [message, setMessage] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [image, setImage] = useState(null);
  const [savedImage, setSavedImage] = useState(null);


  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleAttachImage = () => {
    setShowImageInput(true);
  };

  const handleConfirmImage = () => {
    if (image) {
      const savedImageCopy = new File([image], image.name, { type: image.type });
      setImage(null);
      setSavedImage(savedImageCopy);
    }
  };

  const handleImageInputChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  const handlePublish = () => {
    const savedMessage = message;
    const savedMessageLength = message.length;

    setMessage('');
    setShowImageInput(false);
    setImage(null);

    // qui bisognerà aggiungere la roba al db
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
                src={URL.createObjectURL(image)}
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
      <Button variant="success" onClick={handlePublish}>
        Pubblica
      </Button>
    </div>
  );
};

export default InputSqueel;
