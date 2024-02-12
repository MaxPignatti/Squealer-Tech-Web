import { createContext, useContext, useState, useMemo } from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	const login = () => {
		setIsAuthenticated(true);
	};

	const logout = () => {
		setIsAuthenticated(false);
	};

	return (
		<AuthContext.Provider
			value={useMemo(
				() => ({ isAuthenticated, login, logout }),
				[isAuthenticated, login, logout]
			)}
		>
			{children}
		</AuthContext.Provider>
	);
};

AuthProvider.propTypes = {
	children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
