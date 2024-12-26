import React, { createContext, useState, useEffect, useContext } from 'react';

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
      const token = localStorage.getItem('token');

      if (!token) {
        setUser({
          isAuthenticated: false,
          isLineMonitor: false,
          isSuperUser: false,
        });
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/profile/verify-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Include token
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser({
            isAuthenticated: true,
            isLineMonitor: data.isLineMonitor,
            isSuperUser: data.isSuperUser,
          });
        } else {
          console.error('Token verification failed');
          localStorage.removeItem('token'); // Clear invalid token
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        localStorage.removeItem('token'); // Clear invalid token
      } finally {
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

// Export useUser hook for consuming the context
export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
};

export default UserContext;