import React, { useState } from 'react';
import { Button } from 'react-bootstrap';

const ImageUploader = (image, imagePreview, handleImageChange, handleRemoveImage) => {
    console.log('Stato attuale di image:', image);
    return (
    <div>
      {image != null ? (
        <>
          <img src={imagePreview} alt="Anteprima" className="img-fluid mb-2" />
          <Button variant="danger" onClick={handleRemoveImage} className="mb-2">
            Annulla Foto
          </Button>
        </>
      ) : (
        <>
          <input type="file" accept="image/*" onChange={handleImageChange} className="mb-2" />
          <Button variant="primary" onClick={() => document.querySelector('input[type="file"]').click()}>
            Allega Foto
          </Button>
        </>
      )}
    </div>
  );
};

export default ImageUploader;
