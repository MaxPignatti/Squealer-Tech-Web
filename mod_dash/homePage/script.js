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

	if (!isLoggedIn && currentPage !== "login.html") {
		window.location.href = "../loginPage/login.html";
	}
}
