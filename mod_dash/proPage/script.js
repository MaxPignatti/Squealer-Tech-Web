document.addEventListener('DOMContentLoaded', () => {
	fetchUsersWithProRequest();
});

function fetchUsersWithProRequest() {
	fetch('http://localhost:3500/usr', {
		method: 'GET',
	})
		.then((response) => response.json())
		.then((users) => {
			const proRequestedUsers = users.filter((user) => user.isProRequested);
			displayUsers(proRequestedUsers);
		})
		.catch((error) => console.error('Error fetching users:', error));
}

function displayUsers(users) {
	const usersList = document.getElementById('usersList');
	usersList.innerHTML = '';
	users.forEach((user) => {
		const userElement = document.createElement('div');
		userElement.innerHTML = `
            <p>Name: ${user.firstName} ${user.lastName}</p>
            <p>Email: ${user.email}</p>
            <button onclick="handleProAcceptance('${user.username}', true)">Accept</button>
            <button onclick="handleProAcceptance('${user.username}', false)">Reject</button>
        `;
		usersList.appendChild(userElement);
	});
}

function handleProAcceptance(username, accept) {
	fetch(`http://localhost:3500/usr/${username}/proAcceptance`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ accept }),
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error('Failed to update user status');
			}
			return response.json();
		})
		.then((data) => {
			alert(data.message);
			fetchUsersWithProRequest(); // Refresh the user list
		})
		.catch((error) => {
			console.error('Error updating user status:', error);
			alert(error.message);
		});
}
