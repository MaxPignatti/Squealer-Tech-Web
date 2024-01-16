import React from "react";
import Navbar from "./Navbar";
import Profile from "./Profile";
import { Routes, Route, Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import { useAuth } from "../AuthContext";
import { Navigate } from "react-router-dom";
import MainPage from "./MainPage";
import ChannelsPage from "./ChannelComponents/ChannelsPage";
import ShopPage from "./ShopPage";
import Ricerca from "./Ricerca";
import Pro from "./Pro";
import UserMention from "./userMention";

const HomePage = () => {
	const { isAuthenticated } = useAuth();
	if (!isAuthenticated) {
		return <Navigate to="/login" />;
	}

	return (
		<>
			<Navbar />
			<Container>
				<Routes>
					<Route
						path="/*"
						element={<MainPage />}
					/>
					<Route
						path="/Profile"
						element={<Profile />}
					/>
					<Route
						path="/Channels"
						element={<ChannelsPage />}
					/>
					<Route
						path="/Shop"
						element={<ShopPage />}
					/>
					<Route
						path="/Ricerca"
						element={<Ricerca />}
					/>
					<Route
						path="/UserMention"
						element={<UserMention />}
					/>
				</Routes>
			</Container>
		</>
	);
};

export default HomePage;
