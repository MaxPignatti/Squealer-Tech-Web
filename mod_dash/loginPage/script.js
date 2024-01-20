document.addEventListener("DOMContentLoaded", () => {
	const loginForm = document.getElementById("loginForm");

	loginForm.addEventListener("submit", async (e) => {
		e.preventDefault();

		const username = document.getElementById("username").value;
		const password = document.getElementById("password").value;

		// Send a request to check the credentials and isMod status
		const response = await fetch("http://localhost:3500/loginMod", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ username, password }),
		});

		if (response.ok) {
			const data = await response.json();
			if (data.isMod) {
				window.location.href = "../userPage/index.html";
			} else {
				alert("You are not a moderator.");
			}
		} else {
			alert("Invalid username or password.");
		}
	});
});
