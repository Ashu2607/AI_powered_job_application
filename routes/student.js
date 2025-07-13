// Required Modules
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const nodemailer = require('nodemailer');
const { spawn } = require('child_process');
const csvParser = require('csv-parser');

const router = express.Router();
router.use(cors());

const upload = multer({ dest: 'uploads/' });

// Load CSV on server start
let jdData = [];
fs.createReadStream('job_keywords_output.csv')
  .pipe(csvParser())
  .on('data', (row) => jdData.push(row))
  .on('end', () => console.log('📄 JD CSV Loaded'));

// Email Transporter Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'singhashutosh57266@gmail.com',
    pass: 'Ashu@050702' // ⚠️ Replace with app password or env variable in production
  }
});

// POST /screen_resume
router.post('/screen_resume', upload.single('resume'), async (req, res) => {
  try {
    const { name, email, phone, jobTitle, company } = req.body;
    const resumePath = req.file.path;

    // 1. Parse resume PDF
    const resumeBuffer = fs.readFileSync(resumePath);
    const resumeText = (await pdf(resumeBuffer)).text;

    // 2. Find corresponding JD
    const job = jdData.find(
      (j) => j["Job Title"] === jobTitle && j["Company"] === company
    );
    if (!job) {
      fs.unlinkSync(resumePath); // Cleanup
      return res.status(404).json({ error: "Job not found." });
    }

    // 3. Construct JD text
    const jdText = [
      'Skills: ' + JSON.parse(job["Responsibilities_Keywords"]).join(', '),
      'Experience: ' + JSON.parse(job["Description_Keywords"]).join(', '),
      'Education: ' + JSON.parse(job["Qualifications_Keywords"]).join(', '),
      'Tech Stack: ' + JSON.parse(job["Qualifications_Keywords"]).join(', '),
      'Certifications: ' + JSON.parse(job["Responsibilities_Keywords"]).join(', ')
    ].join('\n');

    // 4. Spawn Python process
    const python = spawn('python3', ['score_resume.py']);
    let output = '', errorOutput = '';

    python.stdin.write(JSON.stringify({ jdText, resumeText }));
    python.stdin.end();

    python.stdout.on('data', (data) => (output += data.toString()));
    python.stderr.on('data', (data) => (errorOutput += data.toString()));

    python.on('close', (code) => {
      fs.unlinkSync(resumePath); // Clean resume file

      if (errorOutput) {
        console.error("⚠️ Python Error:", errorOutput);
        return res.status(500).json({ error: "Python error: " + errorOutput });
      }

      try {
        const { score } = JSON.parse(output);
        let shortlisted = score >= 0.55;
        let emailSent = false;

        if (shortlisted) {
          const mailOptions = {
            from: 'singhashutosh57266@gmail.com',
            to: email,
            subject: `Interview Invitation for ${jobTitle}`,
            text: `Dear ${name},\n\nYou have been shortlisted for the role of ${jobTitle}.\nMatch Score: ${score}\n\nRegards,\nRecruitment Team`
          };

          transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
              console.error("Email failed:", err);
              return res.json({ match_score: score, shortlisted, email_sent: false });
            } else {
              emailSent = true;
              return res.json({ match_score: score, shortlisted, email_sent: true });
            }
          });
        } else {
          return res.json({ match_score: score, shortlisted, email_sent: false });
        }
      } catch (e) {
        console.error("❌ Failed to parse Python output:", e);
        return res.status(500).json({ error: "Failed to parse Python output." });
      }
    });
  } catch (err) {
    console.error("❌ Server Error:", err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
