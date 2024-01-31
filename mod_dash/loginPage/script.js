document.addEventListener("DOMContentLoaded", () => {
	checkLoginStatus();
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
				const userData = {
					username: username,
				};
				localStorage.setItem("userData", JSON.stringify(userData));
				window.location.href = "../userPage/user.html";
			} else {
				alert("You are not a moderator.");
			}
		} else {
			alert("Invalid username or password.");
		}
	});
});

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
