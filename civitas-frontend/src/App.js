import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import SplashScreen from './components/SplashScreen';
import About from './components/About';
import Services from './components/Services';
import Contact from './components/Contact'; // Ensure this is imported correctly if it wasn't
import Help from './components/Help';
import Signup from './components/Signup';
import SignIn from './components/Signin';
import Home from './components/Home';
import Terms from './components/Terms';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import VolunteerDashboard from './components/VolunteerDashboard';
import AdminDashboard from './components/AdminDashboard';

const isAuthenticatedAndAdmin = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  if (!token || !user) return false;
  try {
    const parsedUser = JSON.parse(user);
    // CRUCIAL DEBUG LOG: Check the role being read from localStorage
    console.log('App.js: Parsed User Role from localStorage:', parsedUser.role);
    return parsedUser.role === 'admin';
  } catch (e) {
    console.error('App.js: Error parsing user from localStorage:', e);
    return false;
  }
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        {/* CORRECTED: element prop should be a component, not a string */}
        <Route path="/contact" element={<Contact />} /> 
        <Route path="/help" element={<Help />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/dashboard/*" element={<VolunteerDashboard />} />
        
        <Route
          path="/admin/dashboard/*"
          element={isAuthenticatedAndAdmin() ? <AdminDashboard /> : <Navigate to="/signin" replace />}
        />
        
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
}

export default App;