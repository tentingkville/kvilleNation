import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Navbar from './components/navbar.jsx';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/home.jsx';
import History from './pages/history.jsx';
import Policy from './pages/policy.jsx';
import Calendar from './pages/calendar.jsx';
import LineMonitors from './pages/lineMonitors.jsx';
import Profile from './pages/profile.jsx';
import Login from './pages/login.jsx';
import TentCheck from './pages/tentCheck.jsx';
import LmDashboard from './pages/lmDashboard.jsx';
import { UserProvider, useUser } from './userContext.js';

// Function to protect routes
function ProtectedRoute({ children }) {
  const { user } = useUser();

  if (!user?.isAuthenticated) {
    // Redirect to login if the user is not authenticated
    return <Navigate to="/login" replace />;
  }

  return children; // Render the protected component
}

// Main App component
function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/policy" element={<Policy />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/line-monitors" element={<LineMonitors />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tent-check"
          element={
            <ProtectedRoute>
              <TentCheck />
            </ProtectedRoute>
          }
        />
        <Route
          path="/line-monitor-dashboard"
          element={
            <ProtectedRoute>
              <LmDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

// Render the App into the root element
const root = createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <UserProvider>
      <App />
    </UserProvider>
  </BrowserRouter>
);