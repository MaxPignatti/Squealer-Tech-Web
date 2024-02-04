import React, { useState } from "react";
import Cookies from "js-cookie";
import { Button, Alert, Form } from "react-bootstrap";
import PropTypes from "prop-types";

const CreateChannel = ({ setSubscribedChannels, setYourChannels }) => {
	const [showForm, setShowForm] = useState(false);
	const [channelName, setChannelName] = useState("");
	const [channelDescription, setChannelDescription] = useState("");
	const [errorMessage, setErrorMessage] = useState("");

	const handleChannelNameChange = (e) => {
		const name = e.target.value;
		if (name === name.toLowerCase()) {
			setChannelName(name);
			setErrorMessage(""); // Resetta il messaggio di errore se il nome è valido
		} else {
			setErrorMessage(
				"Il nome del canale non può contenere caratteri maiuscoli."
			);
		}
	};

	const handleCreateChannel = async () => {
		const userDataCookie = Cookies.get("user_data");
		if (userDataCookie) {
			const userData = JSON.parse(userDataCookie);
			const username = userData.username;
			try {
				const response = await fetch("http://localhost:3500/channels", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						name: channelName,
						description: channelDescription,
						creator: username,
					}),
				});

				if (response.status === 201) {
					const responseData = await response.json();
					setShowForm(false);
					setSubscribedChannels((prevChannels) => [
						...prevChannels,
						responseData.newChannel,
					]);
					setYourChannels((prevChannels) => [
						...prevChannels,
						responseData.newChannel,
					]);
				} else {
					console.error(
						"Errore durante la creazione del canale:",
						response.status
					);
				}
			} catch (error) {
				console.error("Errore durante la richiesta POST:", error.message);
			}
		} else {
			console.error("User data not found in cookies");
		}
	};

	return (
		<div className="container mt-3">
			<Button
				variant="primary"
				onClick={() => setShowForm(!showForm)}
			>
				{showForm ? "Nascondi" : "Crea nuovo canale"}
			</Button>

			{showForm && (
				<div className="mt-3">
					<h2>Crea un nuovo canale</h2>
					<Form.Group className="mb-3">
						<Form.Label htmlFor="channelName">Nome del canale</Form.Label>
						<Form.Control
							type="text"
							id="channelName"
							value={channelName}
							onChange={handleChannelNameChange}
						/>
					</Form.Group>
					{errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
					<Form.Group className="mb-3">
						<Form.Label htmlFor="channelDescription">
							Descrizione del canale
						</Form.Label>
						<Form.Control
							type="text"
							id="channelDescription"
							value={channelDescription}
							onChange={(e) => setChannelDescription(e.target.value)}
						/>
					</Form.Group>
					<Button
						variant="success"
						onClick={handleCreateChannel}
					>
						Crea canale
					</Button>
				</div>
			)}
		</div>
	);
};

CreateChannel.propTypes = {
	setSubscribedChannels: PropTypes.func.isRequired,
	setYourChannels: PropTypes.func.isRequired,
};

export default CreateChannel;
