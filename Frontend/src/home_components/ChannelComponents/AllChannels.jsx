import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Form, Card, ListGroup, Button } from "react-bootstrap";
import PropTypes from "prop-types";

const AllChannels = ({
	setSubscribedChannels,
	allChannels,
	setAllChannels,
}) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [filteredChannels, setFilteredChannels] = useState([]);

	const listGroupStyle = {
		maxHeight: "142px",
		overflowY: "auto",
	};

	useEffect(() => {
		const userDataCookie = Cookies.get("user_data");
		if (userDataCookie) {
			const userData = JSON.parse(userDataCookie);
			const username = userData.username;

			fetch(`http://localhost:3500/channels/all/${username}`)
				.then((response) => response.json())
				.then((data) => setAllChannels(data))
				.catch((error) =>
					console.error("Errore durante il recupero di tutti i canali:", error)
				);
		}
	}, []);

	useEffect(() => {
		// Filtra i canali in base al termine di ricerca
		const filtered = allChannels.filter((channel) =>
			channel.name.toLowerCase().includes(searchTerm.toLowerCase())
		);
		setFilteredChannels(filtered);
	}, [searchTerm, allChannels]);

	const handleSubscribe = async (channel) => {
		try {
			const userDataCookie = Cookies.get("user_data");
			if (userDataCookie) {
				const userData = JSON.parse(userDataCookie);
				const username = userData.username;

				const response = await fetch(
					`http://localhost:3500/channels/subscribe/${channel._id}`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ username }),
					}
				);

				if (response.status === 200) {
					console.log("Iscrizione avvenuta con successo.");
					// Rimuovi il canale dalla lista di AllChannels
					setAllChannels((prevChannels) =>
						prevChannels.filter((chan) => chan._id !== channel._id)
					);
					setSubscribedChannels((prevChannels) => [...prevChannels, channel]);
				} else {
					console.error("Errore durante l'iscrizione:", response.status);
				}
			}
		} catch (error) {
			console.error("Errore durante la richiesta di iscrizione:", error);
		}
	};

	return (
		<div className="container mt-3">
			<h1 className="display-4 text-center">TUTTI I CANALI</h1>
			<Form.Group className="mb-3">
				<Form.Label htmlFor="searchTerm">Cerca canale</Form.Label>
				<Form.Control
					type="text"
					id="searchTerm"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
			</Form.Group>
			<Card>
				<ListGroup
					variant="flush"
					style={listGroupStyle}
				>
					{filteredChannels.map((channel, index) => (
						<ListGroup.Item key={channel._id + index}>
							{channel.name}
							<span className="badge bg-primary ms-2">
								{channel.members.length} Iscritti
							</span>
							<Button
								variant="success"
								size="sm"
								className="float-end"
								onClick={() => handleSubscribe(channel)}
							>
								Iscriviti
							</Button>
						</ListGroup.Item>
					))}
				</ListGroup>
			</Card>
		</div>
	);
};

AllChannels.propTypes = {
	setSubscribedChannels: PropTypes.func.isRequired,
	allChannels: PropTypes.arrayOf(
		PropTypes.shape({
			_id: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
			members: PropTypes.arrayOf(PropTypes.string),
		})
	).isRequired,
	setAllChannels: PropTypes.func.isRequired,
};

export default AllChannels;
