document.addEventListener("DOMContentLoaded", () => {
	checkLoginStatus();
	fetchChannels();
	fetchAllMessages();
});

let allMessages = [];
let allChannels = [];

const logoutLink = document.getElementById("logoutLink");
logoutLink.style.display = "block";

logoutLink.addEventListener("click", () => {
	localStorage.removeItem("userData");

	window.location.href = "../loginPage/login.html";
});

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
		<button onclick="updateChannel('${channel._id}', '${channel.name}', '${channel.description}')">Modifica Canale</button>
		<div class="messagesContainer"></div>
	`;
		channelList.appendChild(div);
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
	fetch(`http://localhost:3500/channels/delete/${channelId}`, {
		method: "DELETE",
	})
		.then(() => {
			fetchChannels();
			// window.location.reload();
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
		fetch(`http://localhost:3500/channels/update/${channelId}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: newName, description: newDescription }),
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error("Errore nella risposta del server");
				}
				return response.json();
			})
			.then((data) => {
				fetchChannels();
			})
			.catch((error) =>
				console.error("Errore nella modifica del canale:", error)
			);
	}
}

function fetchAllMessages() {
	fetch("http://localhost:3500/allMessages")
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
		.then((response) => {
			if (!response.ok) {
				throw new Error("Errore nella risposta del server ");
			}
			fetchChannels();
			// window.location.reload();
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
			fetchChannels();
			// window.location.reload();
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

	fetch("http://localhost:3500/channels", {
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

	console.log("Is Logged In:", isLoggedIn);
	console.log("Current Page:", currentPage);

	if (isLoggedIn) {
		if (currentPage === "login.html") {
			console.log("Redirecting to user page...");
			window.location.href = "../userPage/user.html";
		}
	} else {
		if (currentPage !== "login.html") {
			console.log("Redirecting to login page...");
			window.location.href = "../loginPage/login.html";
		}
	}
}
