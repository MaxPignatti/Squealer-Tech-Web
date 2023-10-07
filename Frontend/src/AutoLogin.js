import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

function AutoLogin() {
  const { isAuthenticated, login } = useAuth();
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state

  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('access_token='));

    if (token) {
      const tokenValue = token.split('=')[1];

      // Call your API to check authentication status
      fetch('http://localhost:3500/protected-endpoint', {
        method: 'POST',
        credentials: 'include', // Include credentials (cookies)
      })
        .then((response) => {
          if (response.status === 200) {
            login(); // User is authenticated, set isAuthenticated to true
          } else {
            setError('Authentication failed'); // Authentication failed
          }
        })
        .catch((error) => {
          setError('Authentication failed'); // Handle fetch error
        })
        .finally(() => {
          setLoading(false); // Request completed, set loading to false
        });
    } else {
      setLoading(false); // No token found, set loading to false
    }
  }, [login]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return null; // Return null when not loading or when no error occurred
}

export default AutoLogin;
