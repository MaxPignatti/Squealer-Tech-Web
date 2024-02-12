export const handleMessageChange = (
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
) => {
	const inputMessage = event.target.value;
	const charCounter =
		(currentLocation != null ? 50 : 0) +
		(image != null ? 50 : 0) +
		inputMessage.length;

	if (!publicMessage) {
		setMessage(inputMessage);
	} else if (
		charCounter <= initialDailyCharacters &&
		charCounter <= initialWeeklyCharacters &&
		charCounter <= initialMonthlyCharacters
	) {
		setMessage(inputMessage);
		setDailyCharacters(initialDailyCharacters - charCounter);
		setWeeklyCharacters(initialWeeklyCharacters - charCounter);
		setMonthlyCharacters(initialMonthlyCharacters - charCounter);
	}
};

export const handleImageChange = (
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
) => {
	if (publicMessage) {
		if (
			dailyCharacters >= 50 &&
			weeklyCharacters >= 50 &&
			monthlyCharacters >= 50
		) {
			setDailyCharacters(dailyCharacters - 50);
			setWeeklyCharacters(weeklyCharacters - 50);
			setMonthlyCharacters(monthlyCharacters - 50);
		} else {
			alert('Not enough characters for an image upload.');
			return;
		}
	}
	if (e.target.files?.[0]) {
		const file = e.target.files[0];

		const reader = new FileReader();
		reader.onload = (event) => {
			setImage(event.target.result); // Salva l'immagine in base64
			setImagePreview(event.target.result); // Imposta l'anteprima dell'immagine
		};
		reader.readAsDataURL(file);
	}
};

export const handleRemoveImage = (
	setImage,
	setImagePreview,
	setDailyCharacters,
	setWeeklyCharacters,
	setMonthlyCharacters,
	publicMessage,
	dailyCharacters,
	weeklyCharacters,
	monthlyCharacters
) => {
	setImage(null);
	setImagePreview(null);
	if (publicMessage) {
		setDailyCharacters(dailyCharacters + 50);
		setWeeklyCharacters(weeklyCharacters + 50);
		setMonthlyCharacters(monthlyCharacters + 50);
	}
};

export const toggleMap = (
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
) => {
	if (showMap) {
		handleCloseMap(
			setShowMap,
			setCurrentLocation,
			setDailyCharacters,
			setWeeklyCharacters,
			setMonthlyCharacters,
			publicMessage,
			dailyCharacters,
			weeklyCharacters,
			monthlyCharacters
		);
	} else {
		handleOpenMap(
			setDailyCharacters,
			setWeeklyCharacters,
			setMonthlyCharacters,
			setShowMap,
			publicMessage,
			setCurrentLocation,
			dailyCharacters,
			weeklyCharacters,
			monthlyCharacters
		);
	}
};

export const handleOpenMap = (
	setDailyCharacters,
	setWeeklyCharacters,
	setMonthlyCharacters,
	setShowMap,
	publicMessage,
	setCurrentLocation,
	dailyCharacters,
	weeklyCharacters,
	monthlyCharacters
) => {
	if (publicMessage) {
		if (
			dailyCharacters >= 50 &&
			weeklyCharacters >= 50 &&
			monthlyCharacters >= 50
		) {
			setDailyCharacters(dailyCharacters - 50);
			setWeeklyCharacters(weeklyCharacters - 50);
			setMonthlyCharacters(monthlyCharacters - 50);
		} else {
			alert('Not enough characters for a position upload.');
			return;
		}
	}
	setShowMap(true);
	handleGetLocation(setCurrentLocation);
};

export const handleCloseMap = (
	setShowMap,
	setCurrentLocation,
	setDailyCharacters,
	setWeeklyCharacters,
	setMonthlyCharacters,
	publicMessage,
	dailyCharacters,
	weeklyCharacters,
	monthlyCharacters
) => {
	setShowMap(false);
	setCurrentLocation(null);
	if (publicMessage) {
		setDailyCharacters(dailyCharacters + 50);
		setWeeklyCharacters(weeklyCharacters + 50);
		setMonthlyCharacters(monthlyCharacters + 50);
	}
};

export const handleGetLocation = (setCurrentLocation) => {
	navigator.geolocation.getCurrentPosition(
		(position) => {
			const { latitude, longitude } = position.coords;
			if (latitude != null && longitude != null) {
				setCurrentLocation([latitude, longitude]);
			} else {
				console.error('Invalid coordinates received');
			}
		},
		(error) => {
			console.error('Error getting location:', error);
		}
	);
};

export const sendLocationPeriodically = (
	messageId,
	currentLocation,
	sendLocationToBackend,
	setCurrentLocation
) => {
	let intervalId;

	intervalId = setInterval(() => {
		handleGetLocation(setCurrentLocation)
			.then(() => {
				return sendLocationToBackend(messageId, currentLocation);
			})
			.catch((error) => {
				console.error('Error getting current location:', error);
			});
	}, 30000);

	// Interrompi l'intervallo
	setTimeout(() => {
		clearInterval(intervalId);
	}, 240000);
};

export const sendLocationToBackend = async (messageId, position) => {
	try {
		const response = await fetch(
			`http://site222327.tw.cs.unibo.it/api/messages/${messageId}/position`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ position }),
			}
		);

		if (!response.ok) {
			console.error('Failed to update location on the backend');
		}
	} catch (error) {
		console.error('Error sending location to backend:', error);
	}
};

// Gestione della selezione del testo
export const handleTextSelect = (e, setSelection) => {
	setSelection({
		start: e.target.selectionStart,
		end: e.target.selectionEnd,
	});
};

// Funzione per inserire il link nel messaggio
export const handleInsertLink = (url, selection, message, setMessage) => {
	if (url && selection.start !== selection.end) {
		const beforeText = message.substring(0, selection.start);
		const linkText = message.substring(selection.start, selection.end);
		const afterText = message.substring(selection.end);
		setMessage(`${beforeText}[${linkText}](${url})${afterText}`);
	} else {
		alert('Per favore, seleziona del testo nel messaggio per linkarlo.');
	}
};
