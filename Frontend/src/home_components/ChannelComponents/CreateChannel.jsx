import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { Button, Alert, Form, Card } from 'react-bootstrap';
import PropTypes from 'prop-types';

const CreateChannel = ({ setSubscribedChannels, setYourChannels }) => {
	const [showForm, setShowForm] = useState(false);
	const [channelName, setChannelName] = useState('');
	const [channelDescription, setChannelDescription] = useState('');
	const [errorMessage, setErrorMessage] = useState('');

	const handleChannelNameChange = (e) => {
		const name = e.target.value;
		if (name === name.toLowerCase()) {
			setChannelName(name);
			setErrorMessage(''); // Resetta il messaggio di errore se il nome è valido
		} else {
			setErrorMessage(
				'Il nome del canale non può contenere caratteri maiuscoli.'
			);
		}
	};

	const handleCreateChannel = async () => {
		const userDataCookie = Cookies.get('user_data');
		if (userDataCookie) {
			const userData = JSON.parse(userDataCookie);
			const username = userData.username;
			try {
				const response = await fetch('http://localhost:3500/channels', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						name: channelName,
						description: channelDescription,
						creator: username,
						isMod: false,
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
						'Errore durante la creazione del canale:',
						response.status
					);
				}
			} catch (error) {
				console.error('Errore durante la richiesta POST:', error.message);
			}
		} else {
			console.error('User data not found in cookies');
		}
	};

	return (
	<div className='container mt-5'>
		<div className="d-flex justify-content-center">
			<Button
				variant='outline-primary'
				size="lg"
				onClick={() => setShowForm(!showForm)}
				className="mb-4"
			>
				{showForm ? 'Nascondi Form' : 'Crea Nuovo Canale'}
			</Button>
		</div>

		{showForm && (
			<Card className="shadow p-4 mb-5 bg-white rounded" aria-labelledby="formTitle">
				<Card.Body>
					<h2 id="formTitle" className="text-center mb-4">Crea un Nuovo Canale</h2>
					<Form>
						<Form.Group className='mb-3'>
							<Form.Label htmlFor='channelName'>Nome del canale</Form.Label>
							<Form.Control
								type='text'
								id='channelName'
								placeholder="Inserisci il nome del canale"
								value={channelName}
								onChange={handleChannelNameChange}
								aria-describedby="channelNameHelpBlock"
							/>
							<Form.Text id="channelNameHelpBlock" muted>
								Il nome del canale deve essere univoco.
							</Form.Text>
						</Form.Group>
						{errorMessage && <Alert variant='danger'>{errorMessage}</Alert>}
						<Form.Group className='mb-4'>
							<Form.Label htmlFor='channelDescription'>Descrizione del canale</Form.Label>
							<Form.Control
								type='text'
								id='channelDescription'
								placeholder="Descrivi brevemente il canale"
								value={channelDescription}
								onChange={(e) => setChannelDescription(e.target.value)}
								aria-describedby="channelDescriptionHelpBlock"
							/>
							<Form.Text id="channelDescriptionHelpBlock" muted>
								Fornisci una breve descrizione per il tuo canale.
							</Form.Text>
						</Form.Group>
						<div className="d-flex justify-content-center">
							<Button
								variant='success'
								onClick={handleCreateChannel}
							>
								Crea Canale
							</Button>
						</div>
					</Form>
				</Card.Body>
			</Card>
		)}
	</div>

	);
};

CreateChannel.propTypes = {
	setSubscribedChannels: PropTypes.func.isRequired,
	setYourChannels: PropTypes.func.isRequired,
};

export default CreateChannel;
