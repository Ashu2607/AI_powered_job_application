import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleFromURL = params.get('role');
    if (roleFromURL === 'student' || roleFromURL === 'recruiter') {
      setRole(roleFromURL);
    } else {
      navigate('/select-role');
    }
  }, [location, navigate]);

  const handleSignUp = async (e) => {
    e.preventDefault();
  
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("SignUp data:", { email, password, role });

    console.log("Sending request to backend...");

  
    try {
      const response = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: email.split('@')[0], // placeholder name from email
          email,
          password,
          role,
        }),
      });

      const data = await response.json();

      console.log("Response received:", data);
      
         // Log server response for debugging
      console.log("Signup response:", data);
      
     

  
      if (!response.ok) {
        // Parse the response body to get the error message
        const data = await response.json(); // or response.text() if it's not in JSON format
        alert(`Error: ${data.message || "Something went wrong. Please try again."}`);
        return;
      }
      
      
      alert("Account created! Redirecting to login...");
      navigate("/login");
  
    } catch (error) {
      console.error("Signup network error:", error);
      alert("Something went wrong. Please try again.");
    }
  };
  

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-5xl font-bold text-[#00D9FF] mb-10">Resume Matcher</h1>

      <div className="w-full max-w-md bg-[#111] p-8 rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-semibold text-center mb-6">
          Sign Up as {role.charAt(0).toUpperCase() + role.slice(1)}
        </h2>

        <form onSubmit={handleSignUp} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-[#1c1c1c] border border-[#333] rounded-lg text-white"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#1c1c1c] border border-[#333] rounded-lg text-white pr-12"
              required
            />
            <span
              className="absolute top-3 right-4 text-gray-400 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#1c1c1c] border border-[#333] rounded-lg text-white pr-12"
              required
            />
            <span
              className="absolute top-3 right-4 text-gray-400 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-gray-400 mt-4">
          Already have an account?{' '}
          <span
            className="text-blue-500 cursor-pointer hover:underline"
            onClick={() => navigate('/login')}
          >
            Log In
          </span>
        </p>
      </div>
    </div>
  );
}

export default SignUpPage;
