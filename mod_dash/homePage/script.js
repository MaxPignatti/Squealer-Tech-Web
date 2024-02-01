document.addEventListener("DOMContentLoaded", () => {
	checkLoginStatus();
	document.getElementById("publicPage").addEventListener("click", () => {
		window.location.href = "../publicSquealPage/public.html";
	});
	document.getElementById("squealPage").addEventListener("click", () => {
		window.location.href = "../squealPage/squeal.html";
	});
	document.getElementById("userPage").addEventListener("click", () => {
		window.location.href = "../userPage/user.html";
	});
});

function checkLoginStatus() {
	const isLoggedIn = localStorage.getItem("userData") !== null;
	const currentPage = window.location.pathname.split("/").pop();

	console.log("Is Logged In:", isLoggedIn);
	console.log("Current Page:", currentPage);

	if (!isLoggedIn && currentPage !== "login.html") {
		console.log("Redirecting to login page...");
		window.location.href = "../loginPage/login.html";
	}
}
