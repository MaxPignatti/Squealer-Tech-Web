import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Form, Card, ListGroup, Button } from "react-bootstrap";
import PropTypes from "prop-types";
import { BASE_URL } from "../../config";

const AllChannels = ({
	setSubscribedChannels,
	allChannels,
	setAllChannels,
}) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [filteredChannels, setFilteredChannels] = useState([]);

	const listGroupStyle = {
		maxHeight: "243px",
		overflowY: "auto",
	};

	useEffect(() => {
		const userDataCookie = Cookies.get("user_data");
		if (userDataCookie) {
			const userData = JSON.parse(userDataCookie);
			const username = userData.username;

			fetch(`${BASE_URL}/channels?excludeSubscribedBy=${username}`)
				.then((response) => response.json())
				.then((data) => {
					setAllChannels(data);
				})
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
					`${BASE_URL}/channels/${channel._id}/members/${username}`,
					{
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
						},
					}
				);

				if (response.status === 200) {
					console.log("Iscrizione avvenuta con successo.");
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
		<div className='container mt-4'>
			<h1 className='display-4 text-center mb-5'>Tutti i Canali</h1>
			<Form.Group className='mb-4 shadow'>
				<Form.Control
					type='text'
					id='searchTerm'
					placeholder='Cerca canale...'
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className='py-2'
					aria-label='ricerca canale'
					style={{ border: "0", borderRadius: "0.25rem" }}
				/>
			</Form.Group>
			<Card className='shadow'>
				<ListGroup
					variant='flush'
					style={listGroupStyle}
				>
					{filteredChannels.map((channel) => (
						<ListGroup.Item
							key={channel._id}
							className='d-flex justify-content-between align-items-center py-3'
						>
							<div className='ms-3'>
								<h5 className='mb-0'>{channel.name}</h5>
								<span className='badge bg-primary ms-2'>
									{channel.members.length} Iscritti
								</span>
							</div>
							<Button
								variant='outline-success'
								size='sm'
								className='me-3'
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
