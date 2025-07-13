import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message || 'Login failed');
      }

      const data = await response.json();
      const { token, user } = data;

      // Save token and user info in localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', user.role);

      // Redirect based on role
      if (user.role === 'recruiter') {
        navigate('/recruiter-form');
      } else if (user.role === 'student') {
        navigate('/student-form');
      } else {
        alert('User role not recognized.');
      }
    } catch (error) {
      alert(error.message);
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
