// src/AppWrapper.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import LoginPage from './components/loginPage';
import SignUpPage from './components/signUppage.jsx';

function AppWrapper() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={() => window.location.href = '/'} />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </Router>
  );
}

export default AppWrapper;
