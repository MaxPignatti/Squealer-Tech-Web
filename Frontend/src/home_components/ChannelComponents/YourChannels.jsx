import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import {
	Card,
	ListGroup,
	Button,
	OverlayTrigger,
	Tooltip,
} from "react-bootstrap";
import PropTypes from "prop-types";
import { BASE_URL } from "../../config";

const YourChannels = ({
	yourChannels,
	setYourChannels,
	setSubscribedChannels,
	setAllChannels,
}) => {
	const [membersList, setMembersList] = useState([]);
	const [selectedChannelId, setSelectedChannelId] = useState(null);

	const listGroupStyle = {
		maxHeight: "243px",
		overflowY: "auto",
	};

	useEffect(() => {
		const userDataCookie = Cookies.get("user_data");
		if (userDataCookie) {
			const userData = JSON.parse(userDataCookie);
			const username = userData.username;

			fetch(`${BASE_URL}/users/${username}/channel`)
				.then((response) => response.json())
				.then((data) => setYourChannels(data))
				.catch((error) =>
					console.error("Errore durante il recupero dei canali:", error)
				);
		}
	}, []);

	const handleDeleteChannel = async (channel) => {
		try {
			const userDataCookie = Cookies.get("user_data");
			if (userDataCookie) {
				const response = await fetch(`${BASE_URL}/channels/${channel._id}`, {
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
				});

				if (response.status === 200) {
					console.log("Canale eliminato con successo.");
					setSubscribedChannels((prevChannels) =>
						prevChannels.filter((chan) => chan._id !== channel._id)
					);
					setYourChannels((prevChannels) =>
						prevChannels.filter((chan) => chan._id !== channel._id)
					);
					setAllChannels((prevChannels) =>
						prevChannels.filter((chan) => chan._id !== channel._id)
					);
				} else {
					console.error(
						"Errore durante l'eliminazione del canale:",
						response.status
					);
				}
			}
		} catch (error) {
			console.error("Errore durante la richiesta di eliminazione:", error);
		}
	};

	const toggleShowMembers = (members, channelId) => {
		if (selectedChannelId === channelId) {
			// Se l'ID del canale selezionato è già aperto, chiudilo
			setSelectedChannelId(null);
			setMembersList([]);
		} else {
			// Altrimenti, apri la lista dei membri per il canale cliccato
			setMembersList(members);
			setSelectedChannelId(channelId);
		}
	};

	const handleRemoveMember = async (username) => {
		try {
			const response = await fetch(
				`${BASE_URL}/channels/${selectedChannelId}/members/${username}`,
				{
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ username }),
				}
			);
			if (response.status === 200) {
				console.log("Membro rimosso con successo.");
				setMembersList((prevMembers) =>
					prevMembers.filter((member) => member !== username)
				);
			} else {
				console.error(
					"Errore durante la rimozione del membro dal canale:",
					response.status
				);
			}
		} catch (error) {
			console.error(
				"Errore durante la richiesta di rimozione del membro dal canale:",
				error
			);
		}
	};
	const renderTooltip = (props) => (
		<Tooltip {...props}>Clicca per visualizzare gli iscritti</Tooltip>
	);

	return (
		<div className='container mt-3'>
			<h1 className='display-4 text-center mb-5'>I Tuoi Canali</h1>
			<Card className='shadow'>
				<ListGroup
					variant='flush'
					style={listGroupStyle}
				>
					{yourChannels.map((channel) => (
						<ListGroup.Item
							key={channel._id}
							className='d-flex justify-content-between align-items-center py-3'
						>
							<div className='ms-3'>
								<h5 className='mb-0'>{channel.name}</h5>
								<OverlayTrigger
									placement='top'
									overlay={renderTooltip}
								>
									<Button
										className='badge bg-primary ms-2'
										style={{
											cursor: "pointer",
											border: "none",
											background: "none",
										}}
										aria-label={`Visualizza iscritti a ${channel.name}`}
										aria-expanded={selectedChannelId === channel._id}
										onClick={() =>
											toggleShowMembers(channel.members, channel._id)
										}
									>
										{channel.members.length} Iscritti
									</Button>
								</OverlayTrigger>
							</div>
							<Button
								variant='outline-danger'
								size='sm'
								onClick={() => handleDeleteChannel(channel)}
								aria-label={`Elimina canale ${channel.name}`}
							>
								Elimina
							</Button>
							{selectedChannelId === channel._id && (
								<ListGroup className='mt-2'>
									{membersList.map((member) => (
										<ListGroup.Item key={member}>
											{member}
											<Button
												variant='danger'
												size='sm'
												className='float-end'
												onClick={() => handleRemoveMember(member)}
												aria-label={`Rimuovi ${member} da ${channel.name}`}
											>
												Rimuovi
											</Button>
										</ListGroup.Item>
									))}
								</ListGroup>
							)}
						</ListGroup.Item>
					))}
				</ListGroup>
			</Card>
		</div>
	);
};

YourChannels.propTypes = {
	yourChannels: PropTypes.arrayOf(
		PropTypes.shape({
			_id: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
			members: PropTypes.arrayOf(PropTypes.string),
		})
	).isRequired,
	setYourChannels: PropTypes.func.isRequired,
	setSubscribedChannels: PropTypes.func.isRequired,
	setAllChannels: PropTypes.func.isRequired,
};

export default YourChannels;
