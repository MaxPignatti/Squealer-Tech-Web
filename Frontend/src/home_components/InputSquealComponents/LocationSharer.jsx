import React from "react";
import { Button, Alert } from "react-bootstrap";

const LocationSharer = ({ showMap, toggleMap }) => (
	<>
		<Button
			variant="warning"
			onClick={toggleMap}
			className="mb-2 mr-2"
		>
			Condividi la tua Posizione
		</Button>
		{showMap && (
			<Alert
				variant="success"
				className="mt-2"
			>
				<small className="d-block mb-2">Posizione aggiunta</small>
				<Button
					variant="danger"
					onClick={toggleMap}
				>
					Annulla
				</Button>
			</Alert>
		)}
	</>
);

export default LocationSharer;
