import React from "react";
import PropTypes from "prop-types";
import { Form } from "react-bootstrap";

const MessageInput = ({ message, handleMessageChange, handleTextSelect }) => {
	return (
		<Form.Control
			as="textarea"
			value={message}
			onChange={handleMessageChange}
			onSelect={handleTextSelect}
			placeholder="Inserisci il tuo messaggio..."
			style={{ height: "100px", marginBottom: "10px" }}
		/>
	);
};

MessageInput.propTypes = {
	message: PropTypes.string.isRequired,
	handleMessageChange: PropTypes.func.isRequired,
	handleTextSelect: PropTypes.func.isRequired,
};

export default MessageInput;
