import React, { createContext, useState, useEffect } from 'react';

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
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/profile/check-auth`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          console.error(`Error: Received status code ${response.status}`);
          setUser({
            isAuthenticated: false,
            isLineMonitor: false,
            isSuperUser: false,
          });
          setLoading(false);
          return;
        }

        const data = await response.json();
        if (data.isAuthenticated) {
          setUser({
            isAuthenticated: true,
            isLineMonitor: data.isLineMonitor,
            isSuperUser: data.isSuperUser,
          });
        } else {
          setUser({
            isAuthenticated: false,
            isLineMonitor: false,
            isSuperUser: false,
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error checking authentication status:', error);
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;