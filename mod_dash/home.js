document.addEventListener('DOMContentLoaded', () => {
	checkLoginStatus();
	document.getElementById('publicPage').addEventListener('click', () => {
		window.location.href = './public.html';
	});
	document.getElementById('privatePage').addEventListener('click', () => {
		window.location.href = './private.html';
	});
	document.getElementById('squealPage').addEventListener('click', () => {
		window.location.href = './squeal.html';
	});
	document.getElementById('userPage').addEventListener('click', () => {
		window.location.href = './user.html';
	});
	document.getElementById('proPage').addEventListener('click', () => {
		window.location.href = './request.html';
	});
});

function checkLoginStatus() {
	const isLoggedIn = localStorage.getItem('userData') !== null;
	const currentPage = window.location.pathname.split('/').pop();

	if (!isLoggedIn && currentPage !== 'login.html') {
		window.location.href = './login.html';
	}
}
