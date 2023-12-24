import { Button } from 'react-bootstrap';
const ImageUploader = ({ showImageInput, toggleImageInput, imagePreview }) => (
    <>
      <Button variant="primary" onClick={toggleImageInput} className="mb-2 mr-2">
        {showImageInput ? "Annulla Foto" : "Allega Foto"}
      </Button>
      {showImageInput && (
        <input type="file" accept="image/*" className="d-block mb-2" />
      )}
      {imagePreview && (
        <img src={imagePreview} alt="Anteprima" className="img-fluid mb-2" />
      )}
    </>
  );

export default ImageUploader;