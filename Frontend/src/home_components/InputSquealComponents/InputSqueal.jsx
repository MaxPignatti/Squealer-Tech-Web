import React, { useState, useEffect } from "react";
import { Container, Form } from "react-bootstrap";
import Cookies from "js-cookie";
import CharCounter from "./CharCounter";
import ImageUploader from "./ImageUploader";
import LocationSharer from "./LocationSharer";
import MessageInput from "./MessageInput";
import PublishButton from "./PublishButton";
import RecipientSelector from "./RecipientSelector";
import TemporaryMessageOptions from "./TemporaryMessageOptions";
import LinkInserter from "./LinkInserter";
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
} from "./commonFunction";
const InputSqueal = () => {
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
	const [isTemp, setIsTemp] = useState(false);
	const [updateInterval, setUpdateInterval] = useState(0);
	const [maxSendCount, setMaxSendCount] = useState(0);

	const [currentLocation, setCurrentLocation] = useState(null);
	const [showMap, setShowMap] = useState(false);
	const [_id, set_id] = useState(null);

	const [recipientType, setRecipientType] = useState("user");
	const [filteredChannels, setFilteredChannels] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [channels, setChannels] = useState([]);
	const [selectedChannels, setSelectedChannels] = useState([]);

	const [filteredUsers, setFilteredUsers] = useState([]);
	const [users, setUsers] = useState([]);
	const [selectedUsers, setSelectedUsers] = useState([]);
	const [image, setImage] = useState(null); // Stato per l'immagine in base64
	const [imagePreview, setImagePreview] = useState(null); // Stato per l'anteprima dell'immagine

	//USE EFFECT
	useEffect(() => {
		const userDataCookie = Cookies.get("user_data");
		if (userDataCookie) {
			const userData = JSON.parse(userDataCookie);
			const username = userData.username;

			fetch(`http://localhost:3500/channels/subscribed/${username}`)
				.then((response) => response.json())
				.then((data) => {
					const nonModeratorChannels = data.filter(
						(channel) => !channel.moderatorChannel
					);
					setChannels(nonModeratorChannels);
				})
				.catch((error) =>
					console.error("Errore durante il recupero dei canali:", error)
				);

			fetch(`http://localhost:3500/usr`)
				.then((response) => response.json())
				.then((data) => setUsers(data))
				.catch((error) =>
					console.error("Errore durante il recupero degli utenti:", error)
				);
		}
	}, []);

	useEffect(() => {
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
	}, []);

	useEffect(() => {
		if (selectedChannels.length === 0) {
			setPublicMessage(false);
		} else if (!publicMessage) {
			setPublicMessage(true);
		}
	}, [selectedChannels]);

	useEffect(() => {
		if (publicMessage) {
			const charCounter =
				(currentLocation != null) * 50 + (image != null) * 50 + message.length;
			if (
				charCounter <= initialDailyCharacters &&
				charCounter <= initialWeeklyCharacters &&
				charCounter <= initialMonthlyCharacters
			) {
				setDailyCharacters(initialDailyCharacters - charCounter);
				setWeeklyCharacters(initialWeeklyCharacters - charCounter);
				setMonthlyCharacters(initialMonthlyCharacters - charCounter);
			} else {
				setSelectedChannels([]);
				alert("Not enough characters to send your message (to a channel)");
			}
		} else {
			setDailyCharacters(initialDailyCharacters);
			setWeeklyCharacters(initialWeeklyCharacters);
			setMonthlyCharacters(initialMonthlyCharacters);
		}
	}, [publicMessage]);

	useEffect(() => {
		if (recipientType === "channel") {
			const filtered = channels
				.filter((channel) =>
					channel.name.toLowerCase().includes(searchTerm.toLowerCase())
				)
				.slice(0, 5); // Limita a 5 canali
			setFilteredChannels(filtered);
		} else if (recipientType === "user") {
			const filtered = users
				.filter((user) =>
					user.username.toLowerCase().includes(searchTerm.toLowerCase())
				)
				.slice(0, 5); // Limita a 5 utenti
			setFilteredUsers(filtered);
		}
	}, [searchTerm, channels, users, recipientType]);

	/*
  useEffect(() => {
    const interval = setInterval(() => {
      
      sendLocationPeriodically(_id);
    }, 10000); // Aggiorna ogni 10 secondi

    return () => clearInterval(interval);
  }, []);
  */

	//FUNZIONI PER DESTINATARI
	const handleRecipientChange = (newValue) => {
		setRecipientType(newValue);
	};

	const handleSearchChange = (event) => {
		const newSearchTerm = event.target.value;
		setSearchTerm(newSearchTerm);

		if (recipientType === "user") {
			// Filtra gli utenti in base al termine di ricerca
			const filtered = users.filter((user) =>
				user.username.toLowerCase().includes(newSearchTerm.toLowerCase())
			);
			setFilteredUsers(filtered);
		} else if (recipientType === "channel") {
			// Filtra i canali in base al termine di ricerca
			const filtered = channels.filter((channel) =>
				channel.name.toLowerCase().includes(newSearchTerm.toLowerCase())
			);
			setFilteredChannels(filtered);
		}
	};

	const handleUserSelect = (newUser) => {
		if (!selectedUsers.some((user) => user._id === newUser._id)) {
			setSelectedUsers([...selectedUsers, newUser]);
		}
	};

	const handleChannelSelect = (newChannel) => {
		if (!selectedChannels.some((channel) => channel._id === newChannel._id)) {
			setSelectedChannels([...selectedChannels, newChannel]);
		}
	};

	const handleRemoveUser = (userId) => {
		setSelectedUsers(selectedUsers.filter((user) => user._id !== userId));
	};

	const handleRemoveChannel = (channelId) => {
		setSelectedChannels(
			selectedChannels.filter((channel) => channel._id !== channelId)
		);
	};

	//FUNZIONI PER MESSAGGI TEMPORANEI
	const toggleTemp = () => {
		setIsTemp(!isTemp);
		if (!isTemp) {
			setUpdateInterval("");
			setMaxSendCount("");
		}
	};

	const handleUpdateIntervalChange = (e) => {
		const value = e.target.value;
		if (/^\d+$/.test(value)) {
			const numericValue = parseInt(value);
			if (numericValue >= 1 && numericValue <= 15) {
				setUpdateInterval(numericValue);
			} else {
				setUpdateInterval(numericValue < 1 ? 1 : 60);
			}
		}
	};

	const handleMaxSendCountChange = (e) => {
		const value = e.target.value;
		if (/^\d+$/.test(value)) {
			const numericValue = parseInt(value);
			if (numericValue >= 1 && numericValue <= 20) {
				setMaxSendCount(numericValue);
			} else {
				setMaxSendCount(numericValue < 1 ? 1 : 20);
			}
		}
	};

	//PUBLISH
	const handlePublish = async () => {
		const savedMessage = message;

		if (
			savedMessage &&
			(selectedChannels.length > 0 || selectedUsers.length > 0)
		) {
			const userDataCookie = Cookies.get("user_data");
			setMessage("");
			setImage(null);
			setImagePreview(null);
			setErrorMessage("");
			if (userDataCookie) {
				try {
					const userData = JSON.parse(userDataCookie);
					const currentTime = new Date();
					const isTempMessage = updateInterval && maxSendCount;
					if (isTempMessage && (!updateInterval || !maxSendCount)) {
						alert(
							"Please enter valid update interval and max send count for temporary messages."
						);
						return;
					}
					const requestData = {
						userName: userData.username,
						image: image !== null ? image : null,
						text: savedMessage,
						dailyCharacters: dailyCharacters,
						weeklyCharacters: weeklyCharacters,
						monthlyCharacters: monthlyCharacters,
						updateInterval: isTempMessage ? updateInterval : undefined,
						maxSendCount: isTempMessage ? maxSendCount : undefined,
						nextSendTime: isTempMessage
							? new Date(currentTime.getTime() + updateInterval * 60000)
							: undefined,
						location: currentLocation
							? { latitude: currentLocation[0], longitude: currentLocation[1] }
							: null,
						recipients: {
							channels: selectedChannels.map((channel) => channel.name),
							users: selectedUsers.map((user) => user.username),
						},
					};

					const url = "http://localhost:3500/create";

					const requestOptions = {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(requestData),
					};

					const response = await fetch(url, requestOptions);

					if (response.status === 201) {
						const data = await response.json();
						set_id(data._id);
						window.location.reload();
					} else {
						const data = await response.json();
						console.error("Errore nella creazione del messaggio:", data.error);
					}
				} catch (error) {
					console.error("Errore nella creazione del messaggio:", error);
				}
			}
		} else {
			let errorText = "";
			if (!savedMessage) {
				errorText = "Scrivi qualcosa";
			} else if (selectedChannels.length === 0 && selectedUsers.length === 0) {
				errorText = "Seleziona un destinatario";
			}
			setErrorMessage(errorText);
		}
	};

	return (
		<Container>
			<Form>
				<RecipientSelector
					recipientType={recipientType}
					handleRecipientChange={handleRecipientChange}
					searchTerm={searchTerm}
					handleSearchChange={handleSearchChange}
					filteredChannels={filteredChannels}
					filteredUsers={filteredUsers}
					handleUserSelect={handleUserSelect}
					handleChannelSelect={handleChannelSelect}
					selectedUsers={selectedUsers}
					selectedChannels={selectedChannels}
					handleRemoveUser={handleRemoveUser}
					handleRemoveChannel={handleRemoveChannel}
				/>
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
				<CharCounter
					dailyCharacters={dailyCharacters}
					weeklyCharacters={weeklyCharacters}
					monthlyCharacters={monthlyCharacters}
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
				<TemporaryMessageOptions
					isTemp={isTemp}
					toggleTemp={toggleTemp}
					updateInterval={updateInterval}
					handleUpdateIntervalChange={handleUpdateIntervalChange}
					maxSendCount={maxSendCount}
					handleMaxSendCountChange={handleMaxSendCountChange}
				/>
			</Form>
			<PublishButton handlePublish={handlePublish} />
			{errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
		</Container>
	);
};

export default InputSqueal;
