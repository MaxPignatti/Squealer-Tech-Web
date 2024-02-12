import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Card, ListGroup, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

const YourChannels = ({
	yourChannels,
	setYourChannels,
	setSubscribedChannels,
	setAllChannels,
}) => {
	const [membersList, setMembersList] = useState([]);
	const [selectedChannelId, setSelectedChannelId] = useState(null);

	const listGroupStyle = {
		maxHeight: '142px',
		overflowY: 'auto',
	};

	useEffect(() => {
		const userDataCookie = Cookies.get('user_data');
		if (userDataCookie) {
			const userData = JSON.parse(userDataCookie);
			const username = userData.username;

			fetch(`http://localhost:3500/users/${username}/channel`)
				.then((response) => response.json())
				.then((data) => setYourChannels(data))
				.catch((error) =>
					console.error('Errore durante il recupero dei canali:', error)
				);
		}
	}, []);

	const handleDeleteChannel = async (channel) => {
		try {
			const userDataCookie = Cookies.get('user_data');
			if (userDataCookie) {
				const response = await fetch(
					`http://localhost:3500/channels/${channel._id}`,
					{
						method: 'DELETE',
						headers: {
							'Content-Type': 'application/json',
						},
					}
				);

				if (response.status === 200) {
					console.log('Canale eliminato con successo.');
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
			console.error('Errore durante la richiesta di eliminazione:', error);
		}
	};

	const handleShowMembers = async (members, channelId) => {
		setMembersList(members);
		setSelectedChannelId(channelId);
	};

	const handleRemoveMember = async (username) => {
		try {
			const response = await fetch(
				`http://localhost:3500/channels/${selectedChannelId}/members/${username}`,
				{
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ username }),
				}
			);
			if (response.status === 200) {
				console.log('Membro rimosso con successo.');
				setMembersList((prevMembers) =>
					prevMembers.filter((member) => member !== username)
				);
			} else {
				console.error(
					'Errore durante la rimozione del membro dal canale:',
					response.status
				);
			}
		} catch (error) {
			console.error(
				'Errore durante la richiesta di rimozione del membro dal canale:',
				error
			);
		}
	};

	return (
		<div className='container mt-3'>
			<h1 className='display-4 text-center'>I TUOI CANALI</h1>
			<Card>
				<ListGroup
					variant='flush'
					style={listGroupStyle}
				>
					{yourChannels.map((channel) => (
						<ListGroup.Item key={channel._id}>
							{channel.name}
							<button
								className='badge bg-primary ms-2'
								style={{
									cursor: 'pointer',
									border: 'none',
									background: 'none',
								}}
								onClick={() => {
									if (selectedChannelId === channel._id) {
										setSelectedChannelId(null);
									} else {
										handleShowMembers(channel.members, channel._id);
									}
								}}
							>
								{channel.members.length} Iscritti
							</button>
							<Button
								variant='danger'
								size='sm'
								className='float-end'
								onClick={() => handleDeleteChannel(channel)}
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
