import React, { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { BASE_URL } from "./config";

function AutoLogin() {
	const { login } = useAuth();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const navigate = useNavigate();

	useEffect(() => {
		const userDataCookie = Cookies.get("user_data");
		if (userDataCookie) {
			const userData = JSON.parse(userDataCookie);
			const existingToken = userData.access_token;

			console.log("Existing Token:", existingToken);

			fetch(`${BASE_URL}/protectedEndpoint`, {
				method: "POST",
				credentials: "include",
				headers: {
					Authorization: `Bearer ${existingToken}`,
				},
			})
				.then((response) => {
					if (response.status === 200) {
						login();
						navigate("/");
					}
				})
				.catch((error) => {
					setError("Authentication failed, qualche errore: " + error);
				})
				.finally(() => {
					setLoading(false); // Request completed, set loading to false
				});
		} else {
			console.log("Token not found");
			setLoading(false);
		}
	}, [login]);

	// Helper function to get a cookie by name

	if (loading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div>{error}</div>;
	}

	return null;
}

export default AutoLogin;
