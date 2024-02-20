document.addEventListener("DOMContentLoaded", () => {
	fetchUsersWithProRequest();
});

function fetchUsersWithProRequest() {
	fetch("https://site222327.tw.cs.unibo.it/api/usr", {
		method: "GET",
	})
		.then((response) => response.json())
		.then((users) => {
			const proRequestedUsers = users.filter((user) => user.isProRequested);
			displayUsers(proRequestedUsers);
		})
		.catch((error) => console.error("Error fetching users:", error));
}

function displayUsers(users) {
	const usersList = document.getElementById("usersList");
	usersList.innerHTML = "";
	users.forEach((user) => {
		const userElement = document.createElement("div");
		userElement.classList.add("col-12", "col-md-6", "col-lg-4", "mb-4");
		userElement.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${user.firstName} ${user.lastName}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">${user.email}</h6>
                    <div class="card-text">
                        <button onclick="handleProAcceptance('${user.username}', true)" class="btn btn-success">Accept</button>
                        <button onclick="handleProAcceptance('${user.username}', false)" class="btn btn-danger">Reject</button>
                    </div>
                </div>
            </div>
        `;
		usersList.appendChild(userElement);
	});
}

function handleProAcceptance(username, accept) {
	fetch(`https://site222327.tw.cs.unibo.it/api/usr/${username}/proAcceptance`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ accept }),
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error("Failed to update user status");
			}
			return response.json();
		})
		.then((data) => {
			alert(data.message);
			fetchUsersWithProRequest(); // Refresh the user list
		})
		.catch((error) => {
			console.error("Error updating user status:", error);
			alert(error.message);
		});
}
function checkLoginStatus() {
        const isLoggedIn = localStorage.getItem("userData") !== null;
        const currentPage = window.location.pathname.split("/").pop();

        if (!isLoggedIn && currentPage !== "login.html") {
                window.location.href = "./login.html";
        }
}

