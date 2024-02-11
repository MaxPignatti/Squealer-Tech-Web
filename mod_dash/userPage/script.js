document.addEventListener("DOMContentLoaded", () => {
	checkLoginStatus();
	const userList = document.getElementById("userList");

	let currentFilter = { id: "nameAsc", field: "firstName", order: "asc" };
	setupButtons();

	function setupButtons() {
		const buttonsInfo = [
			{
				id: "nameAsc",
				field: "firstName",
				order: "asc",
				label: "Ordina per nome crescente",
			},
			{
				id: "nameDesc",
				field: "firstName",
				order: "desc",
				label: "Ordina per nome decrescente",
			},
			{
				id: "typeAsc",
				field: "accountType",
				order: "asc",
				label: "Ordina per tipo di account crescente",
			},
			{
				id: "typeDesc",
				field: "accountType",
				order: "desc",
				label: "Ordina per tipo di account decrescente",
			},
			{
				id: "popularityAsc",
				field: "positiveReactionsGiven",
				order: "asc",
				label: "Ordina per popolarità crescente",
			},
			{
				id: "popularityDesc",
				field: "positiveReactionsGiven",
				order: "desc",
				label: "Ordina per popolarità decrescente",
			},
		];

		buttonsInfo.forEach(({ id, field, order, label }) => {
			const button = document.getElementById(id);
			button.setAttribute("aria-label", label);
			button.addEventListener("click", () => setOrder(id, field, order));
		});
	}

	function setOrder(id, field, order) {
		currentFilter = { id, field, order };
		highlightActiveFilter();
		fetchUsers();
	}

	function highlightActiveFilter() {
		document.querySelectorAll(".filter-section button").forEach((button) => {
			button.classList.remove("btn-success", "active");
			button.classList.add("btn-outline-secondary");
		});

		// Highlight the active filter button
		if (currentFilter.field && currentFilter.order) {
			const activeButton = document.getElementById(currentFilter.id);
			if (activeButton) {
				activeButton.classList.remove("btn-outline-secondary");
				activeButton.classList.add("btn-success", "active");
			}
		}
	}

	function fetchUsers() {
		const nameFilter = document.getElementById("nameFilter").value;
		let queryParams = new URLSearchParams();

		if (nameFilter) queryParams.append("firstName", nameFilter);

		if (currentFilter.field && currentFilter.order) {
			queryParams.append("sortField", currentFilter.field);
			queryParams.append("sortOrder", currentFilter.order);
		}

		const url = `http://localhost:3500/usr?${queryParams.toString()}`;

		userList.innerHTML = "Loading users...";
		fetch(url)
			.then((response) => response.json())
			.then((data) => renderUsers(data))
			.catch((error) => {
				console.error("Error fetching users:", error);
				userList.innerHTML = "Failed to load users.";
			});
	}

	function renderUsers(users) {
		const userListContainer = document.getElementById("userList");
		const table = document.createElement("table");
		table.className = "table";
		table.style.width = "100%";
		table.style.textAlign = "center";
		const thead = document.createElement("thead");
		// ...intestazione della tabella...
		table.appendChild(thead);

		const tbody = document.createElement("tbody");
		users.forEach((user, index) => {
			const tr = document.createElement("tr");
			tr.innerHTML = `
				<td>${user.firstName} ${user.lastName}</td>
				<td>${user.username}</td>
				<td>${user.email}</td>
				<td><input type="number" value="${user.dailyChars}" id="daily-${index}"></td>
				<td><input type="number" value="${user.weeklyChars}" id="weekly-${index}"></td>
				<td><input type="number" value="${
					user.monthlyChars
				}" id="monthly-${index}"></td>
				<td>
					<button onclick="updateChars('${
						user.username
					}', ${index})" class="btn btn-success">Aggiorna</button>
					<button onclick="deleteUser('${
						user.username
					}')" class="btn btn-danger">Elimina</button>
					<button onclick="toggleBlockUser('${user.username}')" id="blockUserBtn-${
				user.username
			}" class="btn ${user.isBlocked ? "btn-success" : "btn-danger"}">
						${user.isBlocked ? "Sblocca" : "Blocca"}
					</button>
					<button onclick="toggleModUser('${user.username}')" id="modUserBtn-${
				user.username
			}" class="btn ${user.isMod ? "btn-danger" : "btn-success"}">
						${user.isMod ? "Rimuovi moderatore" : "Aggiungi moderatore"}
					</button>
				</td>
			`;
			tbody.appendChild(tr);
		});
		table.appendChild(tbody);
		userListContainer.innerHTML = "";
		userListContainer.appendChild(table);
	}

	window.blockUnblockUser = function (username, blockStatus) {
		console.log(`${blockStatus ? "Blocking" : "Unblocking"} user: ${username}`);
	};

	window.adjustCharacters = function (username) {
		const additionalChars = document.getElementById(`char-${username}`).value;
		console.log(`Adjusting characters for ${username} by ${additionalChars}`);
	};

	window.updateChars = function (username, index) {
		const dailyChars = document.getElementById(`daily-${index}`).value;
		const weeklyChars = document.getElementById(`weekly-${index}`).value;
		const monthlyChars = document.getElementById(`monthly-${index}`).value;

		// Creare un oggetto con i dati da inviare
		const requestData = {
			username: username,
			dailyChars: dailyChars,
			weeklyChars: weeklyChars,
			monthlyChars: monthlyChars,
		};

		fetch("http://localhost:3500/api/updateUserChars", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(requestData),
		})
			.then((response) => response.json())
			.then((data) => {})
			.catch((error) => {
				console.error("Errore durante l'aggiornamento dei caratteri:", error);
			});
	};

	window.deleteUser = function (username) {
		if (confirm("Sei sicuro di voler eliminare questo utente?")) {
			fetch(`http://localhost:3500/api/deleteUser/${username}`, {
				method: "DELETE",
			})
				.then(() => {
					fetchUsers();
				})
				.catch((error) => {
					console.error("Errore durante l'eliminazione dell'utente:", error);
				});
		}
	};

	window.toggleModUser = function (username) {
		const modButton = document.getElementById("modUserBtn-" + username);

		// Invia una richiesta al backend per impostare/rimuovere il ruolo di moderatore per l'utente
		fetch(`http://localhost:3500/api/toggleModUser/${username}`, {
			method: "POST",
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.isMod) {
					modButton.textContent = "Rimuovi Moderatore";
					modButton.classList.remove("btn-primary");
					modButton.classList.add("btn-danger");
					modButton.setAttribute(
						"aria-label",
						"Rimuovi il ruolo di moderatore per " + username
					);
				} else {
					modButton.textContent = "Imposta Moderatore";
					modButton.classList.remove("btn-danger");
					modButton.classList.add("btn-primary");
					modButton.setAttribute(
						"aria-label",
						"Imposta come moderatore " + username
					);
				}
			})
			.catch((error) => {
				console.error(
					"Errore durante l'impostazione/rimozione del ruolo di moderatore:",
					error
				);
			});
	};

	const logoutLink = document.getElementById("logoutLink");
	logoutLink.style.display = "block";

	logoutLink.addEventListener("click", () => {
		localStorage.removeItem("userData");

		window.location.href = "../loginPage/login.html";
	});
	highlightActiveFilter();
	fetchUsers();
});

function toggleBlockUser(username) {
	const blockButton = document.getElementById("blockUserBtn-" + username);

	fetch(`http://localhost:3500/api/toggleBlockUser/${username}`, {
		method: "POST",
	})
		.then((response) => response.json())
		.then((data) => {
			if (data.blocked) {
				blockButton.textContent = "Sblocca";
				blockButton.classList.remove("btn-danger");
				blockButton.classList.add("btn-success");
				blockButton.setAttribute("aria-label", "Sblocca utente " + username);
			} else {
				blockButton.textContent = "Blocca";
				blockButton.classList.remove("btn-success");
				blockButton.classList.add("btn-danger");
				blockButton.setAttribute("aria-label", "Blocca utente " + username);
			}
		})
		.catch((error) => {
			console.error("Errore durante il blocco/sblocco dell'utente:", error);
		});
}

function filterUsersByName() {
	const nameFilterInput = document.getElementById("nameFilter");
	const nameFilter = nameFilterInput.value.toLowerCase();

	const userList = document.getElementById("userList");
	const userRows = userList.querySelectorAll("tbody tr");

	userRows.forEach((userRow) => {
		const userName = userRow
			.querySelector("td:first-child")
			.textContent.toLowerCase();
		if (userName.includes(nameFilter)) {
			userRow.style.display = "";
		} else {
			userRow.style.display = "none";
		}
	});
}

function checkLoginStatus() {
	const isLoggedIn = localStorage.getItem("userData") !== null;
	const currentPage = window.location.pathname.split("/").pop();

	if (!isLoggedIn && currentPage !== "login.html") {
		window.location.href = "../loginPage/login.html";
	}
}
