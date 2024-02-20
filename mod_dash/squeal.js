document.addEventListener("DOMContentLoaded", () => {
	checkLoginStatus();
	validateUserAndFetchMessages();
	applyResponsiveTableStyles();
});

let allMessages = [];

const logoutLink = document.getElementById("logoutLink");
logoutLink.setAttribute("role", "button");
logoutLink.setAttribute("aria-label", "Effettua logout");

logoutLink.addEventListener("click", () => {
	localStorage.removeItem("userData");

	window.location.href = "./login.html";
});

function validateUserAndFetchMessages() {
	const userData = JSON.parse(localStorage.getItem("userData"));
	if (!userData) {
		redirectToLogin();
	} else {
		fetch(`https://site222327.tw.cs.unibo.it/api/usr/${userData.username}`)
			.then((response) => response.json())
			.then((userDetails) => {
				if (!userDetails.isMod) {
					redirectToLogin();
				} else {
					fetchAllMessages();
				}
			})
			.catch((error) => {
				console.error(
					"Errore durante il recupero dei dettagli dell'utente:",
					error
				);
				redirectToLogin();
			});
	}
}

function redirectToLogin() {
	localStorage.removeItem("userData");
	window.location.href = "./login.html";
}

function fetchAllMessages() {
	const messageList = document.getElementById("messageList");
	messageList.innerHTML = "Caricamento messaggi in corso...";

	fetch("https://site222327.tw.cs.unibo.it/api/allMessages")
		.then((response) => {
			if (!response.ok) {
				throw new Error("Network response was not ok: " + response.statusText);
			}
			return response.json();
		})
		.then((messages) => {
			allMessages = messages;
			renderMessages(messages);
		})
		.catch((error) => {
			console.error("Errore durante il recupero dei messaggi:", error);
			messageList.innerHTML = "Impossibile caricare i messaggi. " + error;
		});
}

function applyResponsiveTableStyles() {
	const tableContainer = document.querySelector(".table-responsive");
	if (!tableContainer) return;

	// Controlla se la viewport è più piccola di 768px (ad esempio, schermi di smartphone)
	if (window.innerWidth < 768) {
		// Applica stili per dispositivi mobili
		tableContainer.style.maxWidth = "100%";
		tableContainer.style.overflowX = "auto";
	} else {
		// Rimuovi stili specifici per dispositivi mobili per schermi più grandi
		tableContainer.style.maxWidth = "none";
		tableContainer.style.overflowX = "visible";
	}
}

function renderMessages(messages) {
	const messageListContainer = document.getElementById("messageList");
	const responsiveTableContainer = document.createElement("div");
	responsiveTableContainer.className = "table-responsive";

	const table = document.createElement("table");
	table.className = "table";
	table.style.width = "100%";
	table.style.textAlign = "center";

	// Assegna uno stile specifico quando la larghezza della viewport supera i 768px
	if (window.matchMedia("(min-width: 768px)").matches) {
		// Qui puoi definire gli stili specifici per dispositivi più grandi
		// Ad esempio, rimuovere il comportamento scorrevole della table-responsive
		responsiveTableContainer.style.overflowX = "visible";
	}

	const thead = document.createElement("thead");
	thead.innerHTML = `
        <tr>
            <th>Mittente</th>
            <th>Canali</th>
            <th>Messaggio</th>
            <th>Creazione</th>
            <th>Reazioni Pos.</th>
            <th>Reazioni Neg.</th>
            <th>Posizione Reale</th>
            <th>Immagine</th>
            <th>Temporizzato</th>
            <th>Azioni</th>
        </tr>`;
	table.appendChild(thead);

	const tbody = document.createElement("tbody");
	messages.forEach((message) => {
		const tr = document.createElement("tr");
		tr.innerHTML = `
            <td>${message.user}</td>
            <td>${formatChannels(message.channel)}</td>
            <td>${message.text}</td>
            <td>${formatDate(new Date(message.createdAt))}</td>
            <td><input type="number" value="${
							message.positiveReactions
						}" id="positive-${
			message._id
		}" style="width: 80px;" aria-label="Reazioni positive per messaggio ID ${
			message._id
		}"></td>
            <td><input type="number" value="${
							message.negativeReactions
						}" id="negative-${
			message._id
		}" style="width: 80px;" aria-label="Reazioni negative per messaggio ID ${
			message._id
		}"></td>
            <td>${formatBooleanIcon(message.location)}</td>
            <td>${formatBooleanIcon(message.image)}</td>
            <td>${formatBooleanIcon(isTemporizzato(message))}</td>
            <td>
                <button onclick="editMessage('${
									message._id
								}')" class="btn btn-primary" aria-label="Modifica messaggio ID ${
			message._id
		}">Modifica</button>
                <button onclick="updateReactions('${
									message._id
								}')" class="btn btn-success" aria-label="Salva reazioni per messaggio ID ${
			message._id
		}">Salva Reazioni</button>
                <button onclick="deleteMessage('${
									message._id
								}')" class="btn btn-danger" aria-label="Elimina messaggio ID ${
			message._id
		}">Elimina</button>
            </td>`;
		tbody.appendChild(tr);
	});
	table.appendChild(tbody);

	responsiveTableContainer.appendChild(table);
	messageListContainer.innerHTML = "";
	messageListContainer.appendChild(responsiveTableContainer);
}

function formatDate(date) {
	return date.toLocaleDateString("en-US", {
		month: "2-digit",
		day: "2-digit",
		year: "numeric",
	});
}
function formatBooleanIcon(value) {
	if (value) {
		return '<span style="color: green;">✔️</span>';
	}
	return '<span style="color: red;">❌</span>';
}

function formatChannels(channels) {
	return channels && channels.length > 0 ? channels.join(", ") : "Nessuno";
}

function isTemporizzato(message) {
	return message.updateInterval && message.nextSendTime && message.maxSendCount;
}

// Funzione per eliminare un messaggio
function deleteMessage(messageId) {
	if (confirm("Sei sicuro di voler eliminare questo messaggio?")) {
		fetch(`https://site222327.tw.cs.unibo.it/api/messages/${messageId}`, {
			method: "DELETE",
		})
			.then(() => {
				fetchAllMessages();
			})
			.catch((error) => {
				console.error("Errore durante l'eliminazione del messaggio:", error);
			});
	}
}

function applyFilters() {
	const senderFilter = document
		.getElementById("senderFilter")
		.value.toLowerCase();
	const dateFilter = document.getElementById("dateFilter").value;
	const recipientFilter = document
		.getElementById("recipientFilter")
		.value.toLowerCase();

	const filteredMessages = allMessages.filter((message) => {
		const messageDate = new Date(message.createdAt).toISOString().split("T")[0];
		return (
			(senderFilter === "" ||
				message.user.toLowerCase().includes(senderFilter)) &&
			(dateFilter === "" || messageDate === dateFilter) &&
			(recipientFilter === "" ||
				message.channel.some((channel) =>
					channel.toLowerCase().includes(recipientFilter)
				))
		);
	});

	renderMessages(filteredMessages);
}

function editMessage(messageId) {
	const message = allMessages.find((m) => m._id === messageId);
	if (!message) return;

	const channelsString = prompt(
		"Modifica i canali (separati da virgola):",
		message.channel.join(", ")
	);
	if (channelsString !== null) {
		const updatedChannels = channelsString.split(",").map((ch) => ch.trim());
		updateMessageChannels(messageId, updatedChannels);
	}
}

// Funzione per inviare la richiesta di aggiornamento dei canali al server
function updateMessageChannels(messageId, newChannels) {
	fetch(
		`https://site222327.tw.cs.unibo.it/api/messages/${messageId}/channels`,
		{
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ channels: newChannels }),
		}
	)
		.then((response) => response.json())
		.then((data) => {
			fetchAllMessages();
			applyFilters();
		})
		.catch((error) =>
			console.error("Errore durante l'aggiornamento dei canali:", error)
		);
}

function updateReactions(messageId) {
	const positiveReactions = parseInt(
		document.getElementById(`positive-${messageId}`).value,
		10
	);
	const negativeReactions = parseInt(
		document.getElementById(`negative-${messageId}`).value,
		10
	);

	if (
		isNaN(positiveReactions) ||
		isNaN(negativeReactions) ||
		positiveReactions < 0 ||
		negativeReactions < 0
	) {
		alert("Le reazioni devono essere numeri non negativi.");
		return;
	}

	fetch(
		`https://site222327.tw.cs.unibo.it/api/messages/${messageId}/reactions`,
		{
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ positiveReactions, negativeReactions }),
		}
	)
		.then((response) => response.json())
		.then((data) => {
			fetchAllMessages();
		})
		.catch((error) =>
			console.error("Errore durante l'aggiornamento delle reazioni:", error)
		);
}

function checkLoginStatus() {
	const isLoggedIn = localStorage.getItem("userData") !== null;
	const currentPage = window.location.pathname.split("/").pop();

	if (!isLoggedIn && currentPage !== "login.html") {
		window.location.href = "./login.html";
	}
}

window.addEventListener("resize", applyResponsiveTableStyles);
