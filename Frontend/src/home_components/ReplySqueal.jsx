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
	handleTextSelect,
	handleInsertLink,
} from "./InputSquealComponents/commonFunction";
import PropTypes from "prop-types";
import { BASE_URL } from "../config";

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

	const [image, setImage] = useState(null); // Stato per l'immagine in base64
	const [imagePreview, setImagePreview] = useState(null); // Stato per l'anteprima dell'immagine

	//USE EFFECT

	useEffect(() => {
		onStartReplying();
		const userDataCookie = Cookies.get("user_data");
		if (userDataCookie) {
			const userData = JSON.parse(userDataCookie);
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
		setPublicMessage(originalMessage.channel.length !== 0);
	}, []);

	//PUBLISH
	const resetStates = () => {
		setMessage("");
		setImage(null);
		setImagePreview(null);
		setErrorMessage("");
	};

	const createRequestData = (
		savedMessage,
		image,
		dailyCharacters,
		weeklyCharacters,
		monthlyCharacters,
		currentLocation,
		userData
	) => {
		return {
			username: userData.username,
			image: image !== null ? image : null,
			text: savedMessage,
			dailyCharacters: dailyCharacters,
			weeklyCharacters: weeklyCharacters,
			monthlyCharacters: monthlyCharacters,
			location: currentLocation
				? { latitude: currentLocation[0], longitude: currentLocation[1] }
				: null,
		};
	};

	const handleResponse = async (response) => {
		onEndReplying();
		if (response.status === 201) {
			window.location.reload();
		} else {
			const data = await response.json();
			console.error("Errore nella creazione della risposta:", data.error);
		}
	};

	const handlePublish = async () => {
		if (!message) {
			setErrorMessage("Scrivi qualcosa");
			return;
		}

		const userDataCookie = Cookies.get("user_data");
		if (!userDataCookie) {
			console.error("User data not found in cookies");
			return;
		}

		resetStates();

		try {
			const userData = JSON.parse(userDataCookie);
			const requestData = createRequestData(
				message,
				image,
				dailyCharacters,
				weeklyCharacters,
				monthlyCharacters,
				currentLocation,
				userData
			);

			const requestOptions = {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(requestData),
			};

			const response = await fetch(
				`${BASE_URL}/messages/${originalMessage._id}/replies`,
				requestOptions
			);
			await handleResponse(response);
		} catch (error) {
			console.error("Errore nella creazione della risposta:", error);
		}
	};

	return (
		<Container className='my-4'>
			<Row className='justify-content-center'>
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
								<TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
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
						<Row className='mt-3'>
							<Col className='text-center'>
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
