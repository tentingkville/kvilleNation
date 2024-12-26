import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    isAuthenticated: false,
    isLineMonitor: false,
    isSuperUser: false,
    firstName: null,
    lastName: null,
    email: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const rehydrateUser = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/profile/verify-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser({
            isAuthenticated: true,
            isLineMonitor: data.isLineMonitor,
            isSuperUser: data.isSuperUser,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
          });
        } else {
          localStorage.removeItem('token'); // Clear invalid token
        }
      } catch (error) {
        localStorage.removeItem('token'); // Clear invalid token
      } finally {
        setLoading(false);
      }
    };

    rehydrateUser();
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

// Create a custom hook for accessing UserContext
export const useUser = () => {
  return useContext(UserContext);
};

export default UserContext;