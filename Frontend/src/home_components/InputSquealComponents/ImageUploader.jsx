import React from "react";
import { Button, Image } from "react-bootstrap";
import PropTypes from "prop-types";

const ImageUploader = ({
  image,
  imagePreview,
  handleImageChange,
  handleRemoveImage,
}) => {

    // Funzione per gestire la pressione dei tasti quando il label è in focus
    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        document.getElementById('imageUpload').click();
      }
    };
  return (
    <div>
      {!image ? (
        <>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mb-2"
            hidden
            id="imageUpload"
          />
          <label 
            htmlFor="imageUpload" 
            className="btn btn-primary mb-2" 
            tabIndex={0} 
            role="button" 
            aria-label="Upload Image"
            onKeyDown={handleKeyDown} 
          >
            Allega Foto
          </label>
        </>
      ) : (
        <>
          <Image
            src={imagePreview}
            alt="Anteprima"
            className="img-fluid mb-2"
            tabIndex={0} 
            role="img"
            aria-label="Image Preview"
          />
          <Button variant="danger" onClick={handleRemoveImage} className="mb-2" aria-label="annulla immagine">
            Annulla Foto
          </Button>
        </>
      )}
    </div>
  );
};

ImageUploader.propTypes = {
  image: PropTypes.string,
  imagePreview: PropTypes.string,
  handleImageChange: PropTypes.func.isRequired,
  handleRemoveImage: PropTypes.func.isRequired,
};

export default ImageUploader;

