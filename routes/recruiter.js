const express = require('express');
const Job = require('../models/job'); // You need a Job model
const authMiddleware = require('../middleware/authenticate');

const router = express.Router();

// POST /api/jobs - Recruiter posts a job
router.post('/jobs', authMiddleware, async (req, res) => {
  const { jobs } = req.body;

  // Optional: Only allow recruiters to post
  if (req.user.role !== 'recruiter') {
    return res.status(403).json({ message: 'Only recruiters can post jobs.' });
  }

  try {
    const createdJobs = await Job.insertMany(
      jobs.map(job => ({
        ...job,
        postedBy: req.user._id,
      }))
    );

    res.status(201).json({ message: 'Job posted successfully!', jobs: createdJobs });
  } catch (err) {
    console.error('Error posting job:', err);
    res.status(500).json({ message: 'Error posting job' });
  }
});

// GET /api/jobs/my - Get recruiter's posted jobs
router.get('/jobs/my', authMiddleware, async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id });
    console.log('Jobs fetched for recruiter:', jobs);
    res.status(200).json({ jobs });
  } catch (err) {
    console.error('Error fetching jobs:', err);
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});

router.get('/jobs/all', authMiddleware, async (req, res) => {
  try {
    const jobs = await Job.find();
    console.log('Jobs fetched for recruiter:', jobs);
    res.status(200).json({ jobs });
  } catch (err) {
    console.error('Error fetching jobs:', err);
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});


module.exports = router;
