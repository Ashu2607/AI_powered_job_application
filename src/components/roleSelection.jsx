import React from 'react';
import { useNavigate } from 'react-router-dom';

const RoleSelectionPage = () => {
  const navigate = useNavigate();

  const handleSelect = (role) => {
    navigate(`/signup?role=${role}`);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 text-white">
      <h1 className="text-5xl font-bold text-[#00D9FF] mb-12">Resume Matcher</h1>

      <div className="bg-[#111] p-10 rounded-xl shadow-lg w-full max-w-sm text-center space-y-6">
        <h2 className="text-2xl font-semibold">Select Your Role</h2>
        <button
          onClick={() => handleSelect('student')}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold"
        >
          I am a Student
        </button>
        <button
          onClick={() => handleSelect('recruiter')}
          className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold"
        >
          I am a Recruiter
        </button>
      </div>
    </div>
  );
};

export default RoleSelectionPage;
