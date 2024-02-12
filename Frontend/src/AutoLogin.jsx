import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

function AutoLogin() {
	const { isAuthenticated, login } = useAuth();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const navigate = useNavigate();

	useEffect(() => {
		const userDataCookie = Cookies.get('user_data');
		if (userDataCookie) {
			const userData = JSON.parse(userDataCookie);
			const existingToken = userData.access_token;

			console.log('Existing Token:', existingToken);

			fetch('http://localhost:3500/protectedEndpoint', {
				method: 'POST',
				credentials: 'include',
				headers: {
					Authorization: `Bearer ${existingToken}`,
				},
			})
				.then((response) => {
					if (response.status === 200) {
						login();
						navigate('/');
					} else {
						setError('Authentication failed, non va protectedEndpoint');
					}
				})
				.catch((error) => {
					setError('Authentication failed, qualche errore: ' + error); // Handle fetch error
				})
				.finally(() => {
					setLoading(false); // Request completed, set loading to false
				});
		} else {
			console.log('Token not found');
			setLoading(false);
		}
	}, [login]);

	// Helper function to get a cookie by name
	function getCookie(name) {
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);
		if (parts.length === 2) return parts.pop().split(';').shift();
	}

	if (loading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div>{error}</div>;
	}

	return null;
}

export default AutoLogin;
