const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const Job = require('../models/job');

// POST /post_jobs_bulk
router.post('/jobs', authenticate, async (req, res) => {
  try {
    const { jobs } = req.body;
    const recruiterId = req.user._id;

    // Validate job input
    if (!Array.isArray(jobs) || jobs.length === 0) {
      return res.status(400).json({ message: "No jobs provided." });
    }

    // Validate each job's required fields
    for (const job of jobs) {
      if (!job.title || !job.description || !job.company) {
        return res.status(400).json({ message: "Each job must have a title, description, and company." });
      }
    }

    // Create job documents
    const jobDocs = jobs.map(job => ({
      title: job.title,
      description: job.description,
      company: job.company,
      recruiter: recruiterId,
      accessRequested: job.accessRequested || false, // ✅ camelCase for consistency
      createdAt: new Date()
    }));

    // Save to DB
    await Job.insertMany(jobDocs);

    // Respond success
    res.status(200).json({ message: "Jobs posted successfully." });
  } catch (err) {
    console.error("Error posting jobs:", err);
    res.status(500).json({ message: "Server error while posting jobs." });
  }
});

module.exports = router;
