document.addEventListener('DOMContentLoaded', () => {
	checkLoginStatus();
	const loginForm = document.getElementById('loginForm');

	loginForm.addEventListener('submit', async (e) => {
		e.preventDefault();

		const username = document.getElementById('username').value;
		const password = document.getElementById('password').value;

		// Send a request to check the credentials and isMod status
		const response = await fetch(
			'http://site222327.tw.cs.unibo.it/api/loginMod',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username, password }),
			}
		);

		if (response.ok) {
			const data = await response.json();
			if (data.isMod) {
				const userData = {
					username: username,
				};
				localStorage.setItem('userData', JSON.stringify(userData));
				window.location.href = '../homePage/home.html';
			} else {
				alert('You are not a moderator.');
			}
		} else {
			alert('Invalid username or password.');
		}
	});
});

function checkLoginStatus() {
	const isLoggedIn = localStorage.getItem('userData') !== null;
	const currentPage = window.location.pathname.split('/').pop();

	if (isLoggedIn && currentPage === 'login.html') {
		window.location.href = '../homePage/home.html';
	}
}
