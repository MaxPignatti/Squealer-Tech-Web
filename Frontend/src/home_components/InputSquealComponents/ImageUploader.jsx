import React, { useState } from "react";
import { Button } from "react-bootstrap";

const ImageUploader = ({
  image,
  imagePreview,
  handleImageChange,
  handleRemoveImage,
}) => {
  return (
    <div>
      {!image ? (
        <>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mb-2"
          />
          <Button
            variant="primary"
            onClick={() => document.querySelector('input[type="file"]').click()}
          >
            Allega Foto
          </Button>
        </>
      ) : (
        <>
          <img src={imagePreview} alt="Anteprima" className="img-fluid mb-2" />
          <Button variant="danger" onClick={handleRemoveImage} className="mb-2">
            Annulla Foto
          </Button>
        </>
      )}
    </div>
  );
};

export default ImageUploader;
