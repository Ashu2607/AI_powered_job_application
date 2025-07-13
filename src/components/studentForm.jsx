import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const StudentForm = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    resume: null,
  });

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const role = localStorage.getItem('role');

    if (!storedToken || role !== 'student') {
      alert('You must be logged in as a student to submit the form.');
      navigate('/login?role=student');
    }
  }, [navigate]);

  const fetchUniqueJobs = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/jobs/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      const seen = new Set();
      const uniqueJobs = [];

      for (let job of data.jobs || []) {
        const key = `${job.title}-${job.company}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueJobs.push(job);
        }
      }

      setJobs(uniqueJobs);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchUniqueJobs();
  }, [token, fetchUniqueJobs]);

  const handleCheckboxChange = (job) => {
    setSelectedJob((prev) =>
      prev && prev.title === job.title && prev.company === job.company ? null : job
    );
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!selectedJob) {
    alert("Please select a job first.");
    return;
  }

  const data = new FormData();
  Object.entries(formData).forEach(([key, value]) => data.append(key, value));
  data.append("jobTitle", selectedJob.title);
  data.append("company", selectedJob.company);

  try {
    const res = await fetch("http://localhost:5000/api/screen_resume", {
      method: "POST",
      body: data,
    });

    const result = await res.json();
    alert(
      result.shortlisted
        ? `✅ Resume shortlisted! Score: ${result.match_score}`
        : `❌ Not shortlisted. Score: ${result.match_score}`
    );
  } catch (error) {
    alert("Error uploading resume");
  }
};

  return (
    <div className="min-h-screen bg-black px-4 py-10 text-white">
      <h2 className="text-4xl font-extrabold text-center mb-10 text-blue-400 animate-pulse tracking-wider">
        🚀 Available Job Postings
      </h2>

      {/* Vertically stacked job cards */}
      <div className="max-w-4xl mx-auto space-y-6 pb-6">
        {jobs.length === 0 ? (
          <p className="text-gray-400 text-center">No jobs available yet.</p>
        ) : (
          jobs.map((job, idx) => (
            <div
              key={idx}
              className={`bg-gray-900 border border-gray-700 rounded-xl p-5 shadow-xl transform transition duration-300 hover:-translate-y-1 ${
                selectedJob?.title === job.title && selectedJob?.company === job.company
                  ? 'shadow-green-500 ring-2 ring-green-500'
                  : 'hover:shadow-green-400'
              }`}
            >
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 accent-green-500"
                  checked={
                    selectedJob?.title === job.title && selectedJob?.company === job.company
                  }
                  onChange={() => handleCheckboxChange(job)}
                />
                <div>
                  <h3 className="text-xl font-semibold text-white">{job.title}</h3>
                  <p className="text-sm text-gray-400 mb-1">Company: {job.company}</p>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{job.description}</p>
                </div>
              </label>
            </div>
          ))
        )}
      </div>

      {/* Resume Upload Form - visible only if job selected */}
      {selectedJob && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 p-8 mt-14 rounded-xl shadow-md w-full max-w-md mx-auto space-y-5 border border-gray-700"
        >
          <h2 className="text-2xl font-semibold text-center text-white">
            Upload Resume for <span className="text-green-400">{selectedJob.title}</span> @{' '}
            <span className="text-green-300">{selectedJob.company}</span>
          </h2>

          <input
            type="text"
            name="name"
            placeholder="Your Name"
            onChange={handleChange}
            required
            className="w-full p-3 border rounded bg-gray-700 text-white placeholder-gray-400"
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            onChange={handleChange}
            required
            className="w-full p-3 border rounded bg-gray-700 text-white placeholder-gray-400"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Your Phone Number"
            onChange={handleChange}
            required
            className="w-full p-3 border rounded bg-gray-700 text-white placeholder-gray-400"
          />
          <input
            type="file"
            name="resume"
            accept=".pdf"
            onChange={handleChange}
            required
            className="w-full p-3 border rounded bg-gray-700 text-white file:bg-green-600 file:text-white file:border-none"
          />

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-lg font-semibold shadow-md hover:shadow-green-500 transition-all"
          >
            Upload Resume
          </button>
        </form>
      )}
    </div>
  );
};

export default StudentForm;
