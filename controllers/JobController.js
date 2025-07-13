const Job = require('../models/job');

// POST /api/jobs
const postJobs = async (req, res) => {
  try {
    const { jobs } = req.body;

    if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
      return res.status(400).json({ message: 'Invalid job data' });
    }

    const recruiterId = req.user?.id;
    if (!recruiterId) {
      return res.status(401).json({ message: 'Unauthorized: Recruiter ID missing' });
    }

    // Append recruiter ID to each job entry
    const jobsWithRecruiter = jobs.map(job => ({
      ...job,
      recruiter: recruiterId
    }));

    const savedJobs = await Job.insertMany(jobsWithRecruiter);
    res.status(201).json({ message: 'Jobs posted successfully!', data: savedJobs });

  } catch (error) {
    console.error('Error saving jobs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { postJobs };
