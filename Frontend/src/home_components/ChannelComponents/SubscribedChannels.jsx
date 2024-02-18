import React, { useEffect } from "react";
import Cookies from "js-cookie";
import { Card, ListGroup, Button } from "react-bootstrap";
import PropTypes from "prop-types";
import { BASE_URL } from "../../config";

const SubscribedChannels = ({
	subscribedChannels,
	setSubscribedChannels,
	setAllChannels,
}) => {
	const listGroupStyle = {
		maxHeight: "243px",
		overflowY: "auto",
	};

	useEffect(() => {
		const userDataCookie = Cookies.get("user_data");
		if (userDataCookie) {
			const userData = JSON.parse(userDataCookie);
			const username = userData.username;

			fetch(`${BASE_URL}/users/${username}/subscribedChannels`)
				.then((response) => response.json())
				.then((data) => {
					setSubscribedChannels(data);
				})
				.catch((error) =>
					console.error("Errore durante il recupero dei canali:", error)
				);
		}
	}, []);

	const handleUnsubscribe = async (channel) => {
		try {
			const userDataCookie = Cookies.get("user_data");
			if (userDataCookie) {
				const userData = JSON.parse(userDataCookie);
				const username = userData.username;

				const response = await fetch(
					`${BASE_URL}/channels/${channel._id}/members/${username}`,
					{
						method: "DELETE",
						headers: {
							"Content-Type": "application/json",
						},
					}
				);

				if (response.status === 200) {
					console.log("Disiscrizione avvenuta con successo.");
					setSubscribedChannels((prevChannels) =>
						prevChannels.filter((chan) => chan._id !== channel._id)
					);
					setAllChannels((prevChannels) => [...prevChannels, channel]);
				} else {
					console.error("Errore durante la disiscrizione:", response.status);
				}
			}
		} catch (error) {
			console.error("Errore durante la richiesta di disiscrizione:", error);
		}
	};

	return (
		<div className='container mt-4'>
			<h1 className='display-4 text-center mb-5'>Canali a cui sei iscritto</h1>
			<Card className='shadow'>
				<ListGroup
					variant='flush'
					style={listGroupStyle}
				>
					{subscribedChannels.map((channel) => (
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
								variant='outline-danger'
								size='sm'
								onClick={() => handleUnsubscribe(channel)}
							>
								Disiscriviti
							</Button>
						</ListGroup.Item>
					))}
				</ListGroup>
			</Card>
		</div>
	);
};

SubscribedChannels.propTypes = {
	subscribedChannels: PropTypes.arrayOf(
		PropTypes.shape({
			_id: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
			members: PropTypes.arrayOf(PropTypes.string),
		})
	).isRequired,
	setSubscribedChannels: PropTypes.func.isRequired,
	setAllChannels: PropTypes.func.isRequired,
};

export default SubscribedChannels;
