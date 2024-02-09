import React, { useState, useEffect } from "react";
import { Container, Col, Row, Form } from "react-bootstrap";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Cookies from "js-cookie";
import CharCounter from "./InputSquealComponents/CharCounter";
import ImageUploader from "./InputSquealComponents/ImageUploader";
import LocationSharer from "./InputSquealComponents/LocationSharer";
import MessageInput from "./InputSquealComponents/MessageInput";
import PublishButton from "./InputSquealComponents/PublishButton";
import LinkInserter from "./InputSquealComponents/LinkInserter";
import {
	handleMessageChange,
	handleImageChange,
	handleRemoveImage,
	toggleMap,
	handleOpenMap,
	handleCloseMap,
	handleGetLocation,
	sendLocationPeriodically,
	sendLocationToBackend,
	handleTextSelect,
	handleInsertLink,
} from "./InputSquealComponents/commonFunction";
import PropTypes from "prop-types";

const ReplySqueal = ({ originalMessage, onStartReplying, onEndReplying }) => {
	//USE STATE DA ORDINARE
	const [message, setMessage] = useState("");
	const [selection, setSelection] = useState({ start: 0, end: 0 });
	const [dailyCharacters, setDailyCharacters] = useState(0);
	const [weeklyCharacters, setWeeklyCharacters] = useState(0);
	const [monthlyCharacters, setMonthlyCharacters] = useState(0);
	const [initialDailyCharacters, setInitialDailyCharacters] = useState(0);
	const [initialWeeklyCharacters, setInitialWeeklyCharacters] = useState(0);
	const [initialMonthlyCharacters, setInitialMonthlyCharacters] = useState(0);
	const [errorMessage, setErrorMessage] = useState("");

	const [publicMessage, setPublicMessage] = useState(false);

	const [currentLocation, setCurrentLocation] = useState(null);
	const [showMap, setShowMap] = useState(false);
	const [_id, set_id] = useState(null);

	const [image, setImage] = useState(null); // Stato per l'immagine in base64
	const [imagePreview, setImagePreview] = useState(null); // Stato per l'anteprima dell'immagine

	//USE EFFECT

	useEffect(() => {
		onStartReplying();
		const userDataCookie = Cookies.get("user_data");
		if (userDataCookie) {
			const userData = JSON.parse(userDataCookie);
			const username = userData.username;

			fetch(`http://localhost:3500/usr/${username}`)
				.then((response) => {
					if (response.status === 200) {
						return response.json();
					} else {
						throw new Error("API call failed");
					}
				})
				.then((data) => {
					setDailyCharacters(data.dailyChars);
					setWeeklyCharacters(data.weeklyChars);
					setMonthlyCharacters(data.monthlyChars);
					setInitialDailyCharacters(data.dailyChars);
					setInitialWeeklyCharacters(data.weeklyChars);
					setInitialMonthlyCharacters(data.monthlyChars);
				})
				.catch((error) => {
					console.error("API call error:", error);
				});
		} else {
			console.error("User data not found in cookies");
		}
		return () => {
			onEndReplying();
		};
	}, []);

	useEffect(() => {
		setPublicMessage(!(originalMessage.channel.length == 0));
	}, []);
	/*
  useEffect(() => {
    const interval = setInterval(() => {
      
      sendLocationPeriodically(_id);
    }, 10000); // Aggiorna ogni 10 secondi

    return () => clearInterval(interval);
  }, []);
  */

	//PUBLISH
	const handlePublish = async () => {
		const savedMessage = message;

		if (savedMessage) {
			const userDataCookie = Cookies.get("user_data");
			setMessage("");
			setImage(null);
			setImagePreview(null);
			setErrorMessage(""); // Reset del messaggio di errore
			if (userDataCookie) {
				try {
					const userData = JSON.parse(userDataCookie);
					const requestData = {
						originalMessageId: originalMessage._id,
						userName: userData.username,
						image: image !== null ? image : null,
						text: savedMessage,
						dailyCharacters: dailyCharacters,
						weeklyCharacters: weeklyCharacters,
						monthlyCharacters: monthlyCharacters,
						location: currentLocation
							? { latitude: currentLocation[0], longitude: currentLocation[1] }
							: null,
					};

					const url = "http://localhost:3500/reply";

					const requestOptions = {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(requestData),
					};

					const response = await fetch(url, requestOptions);
					onEndReplying();
					if (response.status === 201) {
						const data = await response.json();
						set_id(data._id);
						window.location.reload();
					} else {
						const data = await response.json();
						console.error("Errore nella creazione della risposta:", data.error);
					}
				} catch (error) {
					console.error("Errore nella creazione della risposta:", error);
				}
			}
		} else {
			setErrorMessage("Scrivi qualcosa");
		}
	};

	return (
		<Container className="my-4">
			<Row className="justify-content-center">
				<Col
					xs={12}
					md={8}
					lg={6}
				>
					<Form>
						<MessageInput
							message={message}
							handleMessageChange={(event) =>
								handleMessageChange(
									event,
									setMessage,
									setDailyCharacters,
									setWeeklyCharacters,
									setMonthlyCharacters,
									currentLocation,
									image,
									publicMessage,
									initialDailyCharacters,
									initialWeeklyCharacters,
									initialMonthlyCharacters
								)
							}
							handleTextSelect={(e) => handleTextSelect(e, setSelection)}
						/>
						<LinkInserter
							handleInsertLink={(url) =>
								handleInsertLink(url, selection, message, setMessage)
							}
							selection={selection}
						/>
						<ImageUploader
							image={image}
							imagePreview={imagePreview}
							handleImageChange={(e) =>
								handleImageChange(
									e,
									setImage,
									setImagePreview,
									setDailyCharacters,
									setWeeklyCharacters,
									setMonthlyCharacters,
									dailyCharacters,
									weeklyCharacters,
									monthlyCharacters,
									publicMessage
								)
							}
							handleRemoveImage={() =>
								handleRemoveImage(
									setImage,
									setImagePreview,
									setDailyCharacters,
									setWeeklyCharacters,
									setMonthlyCharacters,
									publicMessage,
									dailyCharacters,
									weeklyCharacters,
									monthlyCharacters
								)
							}
						/>
						{showMap && currentLocation && (
							<MapContainer
								center={currentLocation}
								zoom={14}
								scrollWheelZoom={false}
								style={{ height: "200px", width: "100%" }}
							>
								<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
								<Marker position={currentLocation}>
									<Popup>You are here.</Popup>
								</Marker>
							</MapContainer>
						)}
						<LocationSharer
							showMap={showMap}
							toggleMap={() =>
								toggleMap(
									showMap,
									setShowMap,
									setCurrentLocation,
									setDailyCharacters,
									setWeeklyCharacters,
									setMonthlyCharacters,
									publicMessage,
									dailyCharacters,
									weeklyCharacters,
									monthlyCharacters
								)
							}
						/>
						<CharCounter
							dailyCharacters={dailyCharacters}
							weeklyCharacters={weeklyCharacters}
							monthlyCharacters={monthlyCharacters}
						/>
						<Row className="mt-3">
							<Col className="text-center">
								<PublishButton handlePublish={handlePublish} />
							</Col>
						</Row>
						{errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
					</Form>
				</Col>
			</Row>
		</Container>
	);
};

ReplySqueal.propTypes = {
	originalMessage: PropTypes.object.isRequired,
	onStartReplying: PropTypes.func.isRequired,
	onEndReplying: PropTypes.func.isRequired,
};

export default ReplySqueal;
