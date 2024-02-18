import React, { useState, useEffect } from "react";
import { Card, Button } from "react-bootstrap";
import { useAuth } from "../AuthContext";
import Cookies from "js-cookie";
import { BASE_URL } from "../config";

const Pro = () => {
	const { isAuthenticated } = useAuth();
	const [userData, setUserData] = useState({});
	const [isRequestingPro, setIsRequestingPro] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	if (!isAuthenticated) {
		return <Navigate to='/login' />;
	}

	useEffect(() => {
		const userDataCookie = Cookies.get("user_data");
		if (userDataCookie) {
			const userData = JSON.parse(userDataCookie);
			setUserData(userData);
			setIsRequestingPro(userData.isProRequested);
			const username = userData.username;
			fetch(`${BASE_URL}/usr/${username}`)
				.then((response) => {
					if (response.status === 200) {
						return response.json();
					} else {
						throw new Error("API call failed");
					}
				})
				.then((data) => {
					setUserData(data); // Aggiorna i dati dell'utente
					setIsRequestingPro(data.isProRequested); // Aggiorna lo stato in base ai dati aggiornati
				})
				.catch((error) => {
					console.error("API call error:", error);
				});
		} else {
			console.error("User data not found in cookies");
		}
	}, []);

	const cardStyle = {
		border: "3px solid #000", // Imposta lo spessore e il colore dei bordi
		marginTop: "50px", // Imposta il margine superiore per posizionare la card più in alto
	};

	const handleProAction = async (action) => {
		try {
			const response = await fetch(
				`${BASE_URL}/usr/${userData.username}/proStatus`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ action }),
				}
			);

			if (response.status === 200) {
				const updatedUserData = {
					...userData,
					isProRequested: action === "request",
				};
				setUserData(updatedUserData);
				setIsRequestingPro(action === "request");
				// Aggiorna i cookies o altre azioni necessarie
			} else {
				const data = await response.json();
				setErrorMessage(data.error);
			}
		} catch (error) {
			console.error("API call error:", error);
			setErrorMessage(
				"Si è verificato un errore durante la comunicazione con il server."
			);
		}
	};

	function renderCardContent() {
		if (userData.isPro) {
			return <Card.Text>Sei già Pro</Card.Text>;
		} else if (isRequestingPro) {
			return (
				<>
					<Card.Text>Hai già effettuato la richiesta</Card.Text>
					<Button
						variant='danger'
						onClick={() => handleProAction("cancel")}
					>
						Annulla Richiesta
					</Button>
				</>
			);
		} else {
			return (
				<>
					<Card.Text>
						Con un account Pro potrai accedere a vantaggi esclusivi.
					</Card.Text>
					<Button
						variant='primary'
						onClick={() => handleProAction("request")}
					>
						Richiedi
					</Button>
				</>
			);
		}
	}
	return (
		<div className='d-flex justify-content-center align-items-center'>
			<Card style={cardStyle}>
				<Card.Body>
					<Card.Title>Richiedi Account Pro</Card.Title>
					{errorMessage && <p className='text-danger'>{errorMessage}</p>}
					{renderCardContent()}
				</Card.Body>
			</Card>
		</div>
	);
};

export default Pro;
