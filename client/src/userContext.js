import React, { createContext, useState, useEffect } from 'react';

// Create the UserContext
const UserContext = createContext();

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    isAuthenticated: false,
    isLineMonitor: false,
    isSuperUser: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Function to check user authentication status
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/profile/check-auth`, {
          method: 'GET',
          credentials: 'include', // Include cookies for session handling
        });

        if (!response.ok) {
          console.warn(`Authentication check failed: ${response.status} ${response.statusText}`);
          setUser({
            isAuthenticated: false,
            isLineMonitor: false,
            isSuperUser: false,
          });
          return;
        }

        const data = await response.json();
        setUser({
          isAuthenticated: data.isAuthenticated,
          isLineMonitor: data.isLineMonitor || false,
          isSuperUser: data.isSuperUser || false,
        });
      } catch (error) {
        console.error('Error checking authentication status:', error);
        setUser({
          isAuthenticated: false,
          isLineMonitor: false,
          isSuperUser: false,
        });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Show a loading indicator while authentication status is being fetched
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => React.useContext(UserContext);

export default UserContext;