import React from "react";
import { Button } from "react-bootstrap";

const LinkInserter = ({ handleInsertLink, selection }) => {
	const handleButtonClick = () => {
		const url = prompt("Inserisci l'URL del link:");
		handleInsertLink(url);
	};

	return (
		<div className="mb-2">
			<Button
				onClick={handleButtonClick}
				variant="secondary"
			>
				Inserisci Link
			</Button>
		</div>
	);
};

export default LinkInserter;
