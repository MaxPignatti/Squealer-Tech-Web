document.addEventListener("DOMContentLoaded", () => {
	fetchAllMessages();
});

// Funzione per recuperare tutti i messaggi
function fetchAllMessages() {
	const messageList = document.getElementById("messageList");
	messageList.innerHTML = "Caricamento messaggi in corso...";

	fetch("http://localhost:3500/allMessages")
		.then((response) => {
			if (!response.ok) {
				throw new Error("Network response was not ok: " + response.statusText);
			}
			return response.json();
		})
		.then((messages) => {
			console.log(messages);
			renderMessages(messages);
		})
		.catch((error) => {
			console.error("Errore durante il recupero dei messaggi:", error);
			messageList.innerHTML = "Impossibile caricare i messaggi. " + error;
		});
}

// Funzione per mostrare i messaggi in una tabella
function renderMessages(messages) {
	const messageListContainer = document.getElementById("messageList");
	const table = document.createElement("table");
	table.className = "table";

	const thead = document.createElement("thead");
	thead.innerHTML = `
        <tr>
            <th>Utente</th>
            <th>Testo</th>
            <th>Canale</th>
            <th>Azioni</th>
        </tr>`;
	table.appendChild(thead);

	const tbody = document.createElement("tbody");
	messages.forEach((message) => {
		const tr = document.createElement("tr");
		tr.innerHTML = `
            <td>${message.user}</td>
            <td>${message.text}</td>
            <td>${message.channel}</td>
            <td>
                <button onclick="editMessage('${message._id}')" class="btn btn-primary">Modifica</button>
                <button onclick="deleteMessage('${message._id}')" class="btn btn-danger">Elimina</button>
            </td>`;
		tbody.appendChild(tr);
	});
	table.appendChild(tbody);

	messageListContainer.innerHTML = "";
	messageListContainer.appendChild(table);
}

// Funzione per modificare un messaggio
function editMessage(messageId) {
	console.log(`Modifica del messaggio ${messageId}`);
	// Aggiungi qui la logica per modificare il messaggio
}

// Funzione per eliminare un messaggio
function deleteMessage(messageId) {
	if (confirm("Sei sicuro di voler eliminare questo messaggio?")) {
		fetch(`http://localhost:3500/api/deleteMessage/${messageId}`, {
			method: "DELETE",
		})
			.then(() => {
				console.log("Messaggio eliminato con successo");
				fetchAllMessages();
			})
			.catch((error) => {
				console.error("Errore durante l'eliminazione del messaggio:", error);
			});
	}
}
