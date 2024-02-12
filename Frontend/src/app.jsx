import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Login from './login';
import Registration from './registration';
import Home from './home_components/home';
import Profile from './home_components/Profile';
import AutoLogin from './AutoLogin';
import { MessageRefsProvider } from './MessageRefsContext';
import { Container } from 'react-bootstrap';

function App() {
	return (
		<AuthProvider>
			<MessageRefsProvider>
				<AutoLogin />
				<Container>
					<Routes>
						<Route
							path='/login'
							element={<Login />}
						/>
						<Route
							path='/registration'
							element={<Registration />}
						/>
						<Route
							path='/*'
							element={<Home />}
						/>
						<Route
							path='/Profile'
							element={<Profile />}
						/>
					</Routes>
				</Container>
			</MessageRefsProvider>
		</AuthProvider>
	);
}

export default App;
