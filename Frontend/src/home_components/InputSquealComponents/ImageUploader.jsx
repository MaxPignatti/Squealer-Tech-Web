import React from "react";
import { Button, Image } from "react-bootstrap";

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
						hidden
						id="imageUpload"
					/>
					<label
						htmlFor="imageUpload"
						className="btn btn-primary mb-2"
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
					/>
					<Button
						variant="danger"
						onClick={handleRemoveImage}
						className="mb-2"
					>
						Annulla Foto
					</Button>
				</>
			)}
		</div>
	);
};

export default ImageUploader;
