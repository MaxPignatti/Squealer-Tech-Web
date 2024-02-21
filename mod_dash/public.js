document.addEventListener("DOMContentLoaded", function () {
	checkLoginStatus();
	fetchAllMessages();
	fetchChannels();
});

let allMessages = [];
let allChannels = [];

const logoutLink = document.getElementById("logoutLink");
logoutLink.style.display = "block";

logoutLink.addEventListener("click", () => {
	localStorage.removeItem("userData");
	window.location.href = "./login.html";
});

// Fetch e mostra tutti i canali
function fetchChannels() {
	fetch("https://site222327.tw.cs.unibo.it/api/channels/moderator/false")
		.then((response) => response.json())
		.then((channels) => {
			allChannels = channels;
			renderChannels(channels);
		})
		.catch((error) => console.error("Errore:", error));
}

// Mostra i canali nella pagina
function renderChannels(channels) {
	const channelList = document.getElementById("channelList");
	channelList.innerHTML = "";

	channels.forEach((channel) => {
		const card = document.createElement("div");
		card.className = "card mb-3";
		card.id = `channel-${channel._id}`;

		card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${channel.name}</h5>
                <p class="card-text">${channel.description}</p>
                <button onclick="deleteChannel('${channel._id}')" class="btn btn-danger btn-sm" aria-label="Elimina canale ${channel.name}">Elimina Canale</button>
				<button onclick="updateChannel('${channel._id}', '${channel.name}', '${channel.description}')" class="btn btn-primary btn-sm" aria-label="Modifica canale ${channel.name}">Modifica Canale</button>
                <div class="messagesContainer"></div> 
            </div>
        `;

		channelList.appendChild(card);
		renderMessagesForChannel(channel.name, channel._id);
	});
}

function showEditChannelForm(channelId, name, description) {
	document.getElementById("editChannelName").value = name;
	document.getElementById("editChannelDescription").value = description;
	document.getElementById("editChannelId").value = channelId;
	$("#editChannelModal").modal("show");
}

// Elimina un canale
function deleteChannel(channelId) {
	fetch(`https://site222327.tw.cs.unibo.it/api/channels/${channelId}`, {
		method: "DELETE",
	})
		.then(() => {
			fetchChannels();
		})
		.catch((error) =>
			console.error("Errore nell'eliminazione del canale:", error)
		);
}

function updateChannel(channelId, currentName, currentDescription) {
	const newName = prompt("Inserisci il nuovo nome del canale", currentName);
	const newDescription = prompt(
		"Inserisci la nuova descrizione del canale",
		currentDescription
	);

	if (newName && newDescription) {
		fetch(`https://site222327.tw.cs.unibo.it/api/channels/${channelId}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ newName: newName, description: newDescription }),
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error("Errore nella risposta del server");
				}
				return response.json();
			})
			.then((data) => {
				fetchAllMessages();
				fetchChannels();
			})
			.catch((error) =>
				console.error("Errore nella modifica del canale:", error)
			);
	}
}

function fetchAllMessages() {
	fetch("https://site222327.tw.cs.unibo.it/api/allMessages")
		.then((response) => response.json())
		.then((messages) => {
			allMessages = messages;
		})
		.catch((error) => {
			console.error("Errore durante il recupero dei messaggi:", error);
			const messageList = document.getElementById("messageList");
			messageList.innerHTML = "Impossibile caricare i messaggi.";
		});
}

function renderMessagesForChannel(channelName, channelId) {
	const channelDiv = document.getElementById(`channel-${channelId}`);
	if (!channelDiv) {
		console.error(`Div del canale non trovato per ID: channel-${channelId}`);
		return;
	}

	// Filtra i messaggi per il canale corrente
	const messagesForChannel = allMessages.filter((message) =>
		message.channel.includes(channelName)
	);
	if (messagesForChannel.length === 0) {
		// Qui puoi decidere di mostrare o meno un messaggio nel DOM per indicare che non ci sono messaggi
		const noMessagesDiv = document.createElement("div");
		noMessagesDiv.textContent =
			"Nessun messaggio disponibile per questo canale.";
		channelDiv.querySelector(".messagesContainer").appendChild(noMessagesDiv);
		return;
	}

	const table = document.createElement("table");
	table.className = "table table-hover";
	const thead = document.createElement("thead");
	thead.innerHTML = `
        <tr>
            <th scope="col">Utente</th>
            <th scope="col">Messaggio</th>
            <th scope="col">Data</th>
            <th scope="col">Azioni</th>
        </tr>`;
	table.appendChild(thead);

	const tbody = document.createElement("tbody");

	messagesForChannel.forEach((message) => {
		const tr = document.createElement("tr");
		tr.innerHTML = `
            <td>${message.user}</td>
            <td id="messageText-${message._id}-${channelName}">${
			message.text
		}</td>
            <td>${new Date(message.createdAt).toLocaleDateString()}</td>
			<td>
			<button class="btn btn-primary btn-sm" onclick="editMessage('${
				message._id
			}', '${channelName}')" aria-label="Modifica messaggio ${
			message._id
		} in ${channelName}">Modifica</button>
			<button class="btn btn-danger btn-sm" onclick="deleteMessage('${
				message._id
			}')" aria-label="Elimina messaggio ${message._id}">Elimina</button>
		</td>
		`;
		tbody.appendChild(tr);
	});

	table.appendChild(tbody);
	const messagesContainer = channelDiv.querySelector(".messagesContainer");
	messagesContainer.innerHTML = "";
	messagesContainer.appendChild(table);
}

// Elimina un messaggio
function deleteMessage(messageId) {
	fetch(`https://site222327.tw.cs.unibo.it/api/messages/${messageId}`, {
		method: "DELETE",
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error("Errore nella risposta del server ");
			}
			window.location.reload();
		})
		.catch((error) => {
			console.error("Errore nell'eliminazione del messaggio:", error);
		});
}

function editMessage(messageId, channelName) {
	const messageTextElement = document.getElementById(
		`messageText-${messageId}-${channelName}`
	);
	if (!messageTextElement) {
		console.error(
			"Elemento non trovato: ",
			`messageText-${messageId}-${channelName}`
		);
		return;
	}

	const currentText = messageTextElement.innerText;

	messageTextElement.innerHTML = `
    <label for="editText-${messageId}-${channelName}" class="sr-only">Modifica Messaggio</label>
    <input type="text" id="editText-${messageId}-${channelName}" value="${currentText}" aria-label="Campo di testo per modifica messaggio">
    <button onclick="saveMessage('${messageId}', '${channelName}')" aria-label="Salva modifiche al messaggio">Conferma</button>`;
}

function saveMessage(messageId, channelName) {
	const editedTextElement = document.getElementById(
		`editText-${messageId}-${channelName}`
	);
	if (!editedTextElement) {
		console.error(
			"Elemento non trovato: ",
			`editText-${messageId}-${channelName}`
		);
		return;
	}

	const editedText = editedTextElement.value;
	const userData = JSON.parse(localStorage.getItem("userData"));
	const username = userData ? userData.username : null;

	if (!username) {
		console.error("Errore: Username non trovato");
		return;
	}

	fetch(`https://site222327.tw.cs.unibo.it/api/messages/${messageId}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ username: username, text: editedText }),
	})
		.then((response) => response.json())
		.then((data) => {
			fetchChannels();
			window.location.reload();
		})
		.catch((error) => console.error("Errore:", error));
}

function createNewChannel() {
	const name = document.getElementById("newChannelName").value;
	const description = document.getElementById("newChannelDesc").value;

	if (!name.trim() || !description.trim()) {
		alert("Inserisci sia il nome che la descrizione del canale.");
		return;
	}

	const userData = JSON.parse(localStorage.getItem("userData"));
	const username = userData ? userData.username : null;

	fetch("https://site222327.tw.cs.unibo.it/api/channels", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			name: name.toUpperCase(),
			description,
			creator: username,
			isMod: true,
		}),
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error("Errore nella risposta del server");
			}
			return response.json();
		})
		.then((data) => {
			alert("Canale creato con successo!");
			fetchChannels();
		})
		.catch((error) => {
			console.error("Errore nella creazione del canale:", error);
			alert("Si è verificato un errore durante la creazione del canale.");
		});
}

function checkLoginStatus() {
	const isLoggedIn = localStorage.getItem("userData") !== null;
	const currentPage = window.location.pathname.split("/").pop();

	if (!isLoggedIn && currentPage !== "login.html") {
		window.location.href = "./login.html";
	}
}
