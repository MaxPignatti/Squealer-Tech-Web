import React from "react";
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

export default MessageInput;
