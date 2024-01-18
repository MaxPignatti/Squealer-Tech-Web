document.addEventListener("DOMContentLoaded", () => {
	const filterButton = document.getElementById("filterButton");
	const ascOrderButton = document.getElementById("ascOrder");
	const descOrderButton = document.getElementById("descOrder");
	const userList = document.getElementById("userList");
	let currentOrder = "asc"; // Default sorting order

	let currentFilter = { field: "", order: "" };

	// Event listeners for each sorting button
	document
		.getElementById("nameAsc")
		.addEventListener("click", () => setOrder("firstName", "asc"));
	document
		.getElementById("nameDesc")
		.addEventListener("click", () => setOrder("firstName", "desc"));
	document
		.getElementById("typeAsc")
		.addEventListener("click", () => setOrder("accountType", "asc")); // Example
	document
		.getElementById("typeDesc")
		.addEventListener("click", () => setOrder("accountType", "desc")); // Example
	document
		.getElementById("popularityAsc")
		.addEventListener("click", () => setOrder("positiveReactionsGiven", "asc")); // Example
	document
		.getElementById("popularityDesc")
		.addEventListener("click", () =>
			setOrder("positiveReactionsGiven", "desc")
		); // Example

	function setOrder(field, order) {
		currentFilter = { field, order };
		highlightActiveFilter();
		fetchUsers();
	}

	function highlightActiveFilter() {
		// Reset all button classes
		document.querySelectorAll(".filter-section button").forEach((button) => {
			button.classList.remove("btn-success");
			button.classList.add("btn-outline-secondary");
		});

		// Highlight the active filter button
		if (currentFilter.field && currentFilter.order) {
			const buttonId = `${currentFilter.field}${
				currentFilter.order.charAt(0).toUpperCase() +
				currentFilter.order.slice(1)
			}`;
			const activeButton = document.getElementById(buttonId);
			if (activeButton) {
				activeButton.classList.add("btn-success");
				activeButton.classList.remove("btn-outline-secondary");
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
		console.log("Fetching users from URL:", url); // Debugging

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
		const userRows = users
			.map(
				(user) => `
            <div class="user-row">
                <p>Name: ${user.firstName} ${user.lastName}</p>
                <p>Username: ${user.username}</p>
                <p>Email: ${user.email}</p>
                <div>
                    <button onclick="blockUnblockUser('${user.username}', true)" class="btn btn-warning">Block</button>
                    <button onclick="blockUnblockUser('${user.username}', false)" class="btn btn-success">Unblock</button>
                    <input type="number" placeholder="Adjust characters" min="0" id="char-${user.username}" class="form-control">
                    <button onclick="adjustCharacters('${user.username}')" class="btn btn-info">Adjust</button>
                </div>
            </div>
        `
			)
			.join("");
		userList.innerHTML = userRows;
	}

	window.blockUnblockUser = function (username, blockStatus) {
		console.log(`${blockStatus ? "Blocking" : "Unblocking"} user: ${username}`);
		// Implement the actual logic to block/unblock the user
	};

	window.adjustCharacters = function (username) {
		const additionalChars = document.getElementById(`char-${username}`).value;
		console.log(`Adjusting characters for ${username} by ${additionalChars}`);
		// Implement the logic to adjust characters
	};
});
