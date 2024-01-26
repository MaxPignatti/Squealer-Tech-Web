document.addEventListener("DOMContentLoaded", () => {
	fetchAllMessages();
	fetchChannels();
});

let allMessages = [];
let allChannels = [];

// Fetch e mostra tutti i canali
function fetchChannels() {
	fetch("http://localhost:3500/channels/moderator")
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
		const div = document.createElement("div");
		div.id = `channel-${channel.name}`;
		div.innerHTML = `
            <h3>${channel.name}</h3>
            <p>${channel.description}</p>
            <button onclick="deleteChannel('${channel._id}')">Elimina Canale</button>
            <button onclick="showEditChannelForm('${channel._id}', '${channel.name}', '${channel.description}')">Modifica Canale</button>
            <button onclick="manageChannelPosts('${channel._id}')">Gestisci Post</button>
            <div class="messagesContainer"></div>
        `;
		channelList.appendChild(div);

		// Aggiunta dei messaggi al canale
		renderMessagesForChannel(channel.name);
	});
}

// Crea un nuovo canale
function createNewChannel() {
	const name = document.getElementById("newChannelName").value;
	const description = document.getElementById("newChannelDesc").value;

	fetch("http://localhost:3500/channels/create", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name, description }),
	})
		.then((response) => response.json())
		.then((data) => {
			console.log("Canale creato:", data);
			fetchChannels();
		})
		.catch((error) =>
			console.error("Errore nella creazione del canale:", error)
		);
}

// Elimina un canale
function deleteChannel(channelId) {
	fetch(`http://localhost:3500/channels/delete/${channelId}`, {
		method: "DELETE",
	})
		.then(() => {
			console.log("Canale eliminato");
			fetchChannels();
		})
		.catch((error) =>
			console.error("Errore nell'eliminazione del canale:", error)
		);
}

function updateChannel(channelId) {
	const newName = document.getElementById(`channelName-${channelId}`).value;
	const newDescription = document.getElementById(
		`channelDescription-${channelId}`
	).value;

	fetch(`http://localhost:3500/channels/updateModeratorChannel/${channelId}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name: newName, description: newDescription }),
	})
		.then((response) => response.json())
		.then((data) => {
			console.log("Canale aggiornato:", data);
			fetchChannels();
		})
		.catch((error) => console.error("Errore:", error));
}

function fetchAllMessages() {
	fetch("http://localhost:3500/allMessages")
		.then((response) => response.json())
		.then((messages) => {
			allMessages = messages;
			console.log(messages);
		})
		.catch((error) => {
			console.error("Errore durante il recupero dei messaggi:", error);
			const messageList = document.getElementById("messageList");
			messageList.innerHTML = "Impossibile caricare i messaggi.";
		});
}

function renderMessagesForChannel(channelName, channelId) {
	const channelDiv = document.getElementById(`channel-${channelName}`);
	if (!channelDiv) return;

	// Crea la tabella con le classi di Bootstrap
	const table = document.createElement("table");
	table.className = "table table-hover";

	// Intestazione della tabella
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

	// Filtra e aggiungi i messaggi alla tabella
	const messagesForChannel = allMessages.filter((message) =>
		message.channel.includes(channelName)
	);

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
								}', '${channelName}')">Modifica</button>
                <button class="btn btn-danger btn-sm" onclick="deleteMessage('${
									message._id
								}')">Elimina</button>
            </td>`;
		tbody.appendChild(tr);
	});

	table.appendChild(tbody);
	const messagesContainer = channelDiv.querySelector(".messagesContainer");
	messagesContainer.innerHTML = "";
	messagesContainer.appendChild(table);
}

// Elimina un messaggio
function deleteMessage(messageId) {
	fetch(`http://localhost:3500/squeals/delete/${messageId}`, {
		method: "DELETE",
	})
		.then(() => {
			console.log("Messaggio eliminato");
			fetchAllMessages(); // Ricarica i messaggi
		})
		.catch((error) =>
			console.error("Errore nell'eliminazione del messaggio:", error)
		);
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
        <input type="text" id="editText-${messageId}-${channelName}" value="${currentText}">
        <button onclick="saveMessage('${messageId}', '${channelName}')">Conferma</button>`;
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

	fetch(`http://localhost:3500/squeals/edit/${messageId}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ username: username, text: editedText }),
	})
		.then((response) => response.json())
		.then((data) => {
			console.log("Messaggio aggiornato:", data);
			window.location.reload(); // Ricarica la pagina dopo l'aggiornamento
		})
		.catch((error) => console.error("Errore:", error));
}
