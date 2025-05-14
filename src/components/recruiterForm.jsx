import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import Select from 'react-select';

const RecruiterForm = () => {
  const [companyName, setCompanyName] = useState('');
  const [jobEntries, setJobEntries] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [accessRequested, setAccessRequested] = useState(false); // Track access request
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('role');

    if (!token || role !== "recruiter") {
      navigate('/login?role=recruiter');
    }

    // Load job titles and descriptions
    fetch('/job_description_2.csv')
      .then(res => res.text())
      .then(csv => {
        Papa.parse(csv, {
          header: true,
          complete: (result) => {
            const rows = result.data.filter(r => r['Job Title'] && r['Job Description']);
            setJobEntries(rows);
          }
        });
      })
      .catch(err => console.error("CSV load error:", err));
  }, [navigate]);

  const handleJobChange = (selectedOption) => {
    setSelectedJob(selectedOption);
    const found = jobEntries.find(item => item['Job Title'] === selectedOption.value);
    setJobDescription(found ? found['Job Description'] : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('You must be logged in to post a job.');
      navigate('/login?role=recruiter');
      return;
    }

    const job = {
      title: selectedJob.value,
      description: jobDescription,
      company: companyName,
      access_requested: accessRequested, // Include access requested flag
    };

    try {
      const res = await fetch("http://localhost:5000/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobs: [job] }),
      });

      const result = await res.json();
      alert(result.message || "Job posted successfully!");
    } catch (error) {
      console.error("Failed to post job:", error);
      alert("Error posting job.");
    }
  };

  const options = jobEntries.map(item => ({
    label: item['Job Title'],
    value: item['Job Title']
  }));

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white px-4">
      <form onSubmit={handleSubmit} className="bg-gray-900 p-8 rounded shadow-md w-full max-w-2xl space-y-6">
        <h2 className="text-3xl font-bold text-center">Post Job Opening</h2>

        <div>
          <label className="block mb-1 font-semibold">Company Name</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Google, Infosys"
            required
            className="w-full p-3 rounded bg-gray-800 border border-gray-700 text-white"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Select Job Title</label>
          <Select
            options={options}
            value={selectedJob}
            onChange={handleJobChange}
            placeholder="Start typing to filter..."
            className="text-black"
          />
        </div>

        {selectedJob && (
          <div>
            <label className="block mb-1 font-semibold">{selectedJob.label} Description</label>
            <div className="bg-gray-800 text-white p-4 rounded border border-gray-700 whitespace-pre-wrap">
              {jobDescription}
            </div>
          </div>
        )}

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={accessRequested}
            onChange={() => setAccessRequested(!accessRequested)} // Toggle access requested flag
            className="w-4 h-4 text-green-500"
          />
          <label className="text-sm">Request Access for Job Posting</label>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded text-lg"
        >
          Post Job
        </button>
      </form>
    </div>
  );
};

export default RecruiterForm;
