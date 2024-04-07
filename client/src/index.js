import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Navbar from './components/navbar.jsx';
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import Home from './pages/home.jsx';
import History from './pages/history.jsx';
import Policy from './pages/policy.jsx';
import Calendar from './pages/calendar.jsx';
import LineMonitors from './pages/lineMonitors.jsx';
import Profile from './pages/profile.jsx';
import Login from './pages/login.jsx';
import TentSummary from './pages/tentSummary.jsx';


// import { AuthProvider, useAuth } from './AuthContext'; 


// function ProtectedRoute({ children }) {
//     const { isLoggedIn } = useAuth();

//     if (isLoggedIn) {
//         return children;
//     }

//     return <Navigate to="/login" replace />;
// }

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
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/tent-summary" element={<TentSummary />} />
        </Routes>
    </div>
);
}

const root = createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
      <App />
  </BrowserRouter>

);
