import React from "react";
import { Button } from "react-bootstrap";
import PropTypes from "prop-types";

const LinkInserter = ({ handleInsertLink, selection }) => {
	const handleButtonClick = () => {
		const url = prompt("Inserisci l'URL del link:");
		handleInsertLink(url);
	};

	return (
		<div className='mb-2'>
			<Button
				onClick={handleButtonClick}
				variant='secondary'
			>
				Inserisci Link
			</Button>
		</div>
	);
};

LinkInserter.propTypes = {
	handleInsertLink: PropTypes.func.isRequired,
	selection: PropTypes.object.isRequired,
};

export default LinkInserter;
