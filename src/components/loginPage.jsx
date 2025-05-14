// src/components/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const user = users[email];

    if (!user) {
      alert('User not found!');
    } else if (user.password !== password) {
      alert('Incorrect password!');
    } else {
      localStorage.setItem('authToken', email); // Store email as token (for demo)
      
      // Redirect based on role
      if (user.role === 'recruiter') {
        navigate('/recruiter-form');
      } else if (user.role === 'student') {
        navigate('/student-form');
      } else {
        alert('User role not recognized.');
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#111] p-8 rounded-2xl shadow-2xl">
        <h2 className="text-4xl font-extrabold text-[#00D9FF] mb-6 text-center">Log In</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-[#1c1c1c] border border-[#333] rounded-lg text-white"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-[#1c1c1c] border border-[#333] rounded-lg text-white"
            required
          />
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
          >
            Log In
          </button>
        </form>
        <p className="text-center text-gray-400 mt-4">
          Don’t have an account?{' '}
          <span
            className="text-blue-500 cursor-pointer hover:underline"
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
