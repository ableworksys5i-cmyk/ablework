const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const db = require("../db/db");
const applicantController = require("../controllers/applicantCotroller");

// Resume upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/pwd_verification"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["application/pdf", "image/jpeg", "image/png", "image/gif"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  }
});

// UPLOAD RESUME
router.post("/:user_id/resume", upload.single("resume_file"), (req, res) => {
  const user_id = req.params.user_id;
  const resumeFileName = req.file ? req.file.filename : null;

  if (!resumeFileName) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const sql = "UPDATE applicants SET pwd_verification = ? WHERE user_id = ?";
  db.query(sql, [resumeFileName, user_id], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Failed to update resume status" });
    }
    return res.json({ message: "Resume uploaded successfully" });
  });
});

// UPDATE APPLICANT PROFILE
router.put("/:user_id", (req, res) => {
  const user_id = req.params.user_id;
  const { name, email, disability_type, skills, education, preferred_job, latitude, longitude } = req.body;

  // Update users table
  const userSql = "UPDATE users SET name = ?, email = ? WHERE user_id = ?";
  db.query(userSql, [name, email, user_id], (err, userResult) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error updating user" });
    }

    // Update applicants table; preserve existing coordinates when not provided
    const applicantSql = `UPDATE applicants SET disability_type = ?, skills = ?, education = ?, preferred_job = ?, latitude = COALESCE(?, latitude), longitude = COALESCE(?, longitude) WHERE user_id = ?`;
    db.query(applicantSql, [disability_type, skills, education, preferred_job, latitude, longitude, user_id], (err, applicantResult) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Database error updating applicant" });
      }

      res.json({ message: "Profile updated successfully" });
    });
  });
});

// GET APPLICANT PROFILE
router.get("/:user_id", (req, res) => {
  const user_id = req.params.user_id;

  const sql = `
    SELECT users.name, users.email, users.username,
    applicants.disability_type, applicants.skills, applicants.education,
    applicants.preferred_job, applicants.latitude, applicants.longitude,
    applicants.pwd_verification
    FROM users
    JOIN applicants ON users.user_id = applicants.user_id
    WHERE users.user_id = ?
  `;

  db.query(sql, [user_id], (err, result) => {
    if (err) {
      console.log(err);
      return res.json({ message: "Database error" });
    }

    res.json(result[0]);
  });
});

// GET APPLICANT STATS
router.get("/stats/:user_id", applicantController.getStats);

// SAVE A JOB FOR APPLICANT
router.post("/:user_id/saved-jobs/:job_id", (req, res) => {
  const { user_id, job_id } = req.params;

  // First get applicant_id from user_id
  const getApplicantSql = "SELECT applicant_id FROM applicants WHERE user_id = ?";
  db.query(getApplicantSql, [user_id], (err, applicantResult) => {
    if (err) {
      console.log("Get applicant error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (applicantResult.length === 0) {
      return res.status(404).json({ error: "Applicant not found" });
    }

    const applicant_id = applicantResult[0].applicant_id;

    // Insert into saved jobs (ignore if already exists due to UNIQUE constraint)
    const saveSql = "INSERT IGNORE INTO applicant_saved_jobs (applicant_id, job_id) VALUES (?, ?)";
    db.query(saveSql, [applicant_id, job_id], (err, result) => {
      if (err) {
        console.log("Save job error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      if (result.affectedRows === 0) {
        return res.status(409).json({ message: "Job already saved" });
      }
      res.json({ message: "Job saved successfully" });
    });
  });
});

// UNSAVE A JOB FOR APPLICANT
router.delete("/:user_id/saved-jobs/:job_id", (req, res) => {
  const { user_id, job_id } = req.params;

  // First get applicant_id from user_id
  const getApplicantSql = "SELECT applicant_id FROM applicants WHERE user_id = ?";
  db.query(getApplicantSql, [user_id], (err, applicantResult) => {
    if (err) {
      console.log("Get applicant error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (applicantResult.length === 0) {
      return res.status(404).json({ error: "Applicant not found" });
    }

    const applicant_id = applicantResult[0].applicant_id;

    // Delete from saved jobs
    const unsaveSql = "DELETE FROM applicant_saved_jobs WHERE applicant_id = ? AND job_id = ?";
    db.query(unsaveSql, [applicant_id, job_id], (err, result) => {
      if (err) {
        console.log("Unsave job error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Job not saved" });
      }
      res.json({ message: "Job unsaved successfully" });
    });
  });
});

// GET SAVED JOBS FOR APPLICANT
router.get("/:user_id/saved-jobs", (req, res) => {
  const { user_id } = req.params;

  // First get applicant_id from user_id
  const getApplicantSql = "SELECT applicant_id FROM applicants WHERE user_id = ?";
  db.query(getApplicantSql, [user_id], (err, applicantResult) => {
    if (err) {
      console.log("Get applicant error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (applicantResult.length === 0) {
      return res.status(404).json({ error: "Applicant not found" });
    }

    const applicant_id = applicantResult[0].applicant_id;

    // Get saved jobs with job details
    const savedJobsSql = `
      SELECT j.*, sj.saved_at
      FROM applicant_saved_jobs sj
      JOIN jobs j ON sj.job_id = j.job_id
      WHERE sj.applicant_id = ?
      ORDER BY sj.saved_at DESC
    `;
    db.query(savedJobsSql, [applicant_id], (err, result) => {
      if (err) {
        console.log("Get saved jobs error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(result);
    });
  });
});

// ARCHIVE AN APPLICATION
router.put("/:user_id/applications/:application_id/archive", (req, res) => {
  const { user_id, application_id } = req.params;
  const { action } = req.body; // 'archive' or 'restore'

  // First get applicant_id from user_id
  const getApplicantSql = "SELECT applicant_id FROM applicants WHERE user_id = ?";
  db.query(getApplicantSql, [user_id], (err, applicantResult) => {
    if (err) {
      console.log("Get applicant error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (applicantResult.length === 0) {
      return res.status(404).json({ error: "Applicant not found" });
    }

    const applicant_id = applicantResult[0].applicant_id;

    // Check if application belongs to this applicant
    const checkSql = "SELECT application_id FROM applications WHERE application_id = ? AND applicant_id = ?";
    db.query(checkSql, [application_id, applicant_id], (err, checkResult) => {
      if (err) {
        console.log("Check application error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      if (checkResult.length === 0) {
        return res.status(404).json({ error: "Application not found or not authorized" });
      }

      // Update application status
      const newStatus = action === 'archive' ? 'archived' : 'pending';
      const updateSql = "UPDATE applications SET status = ? WHERE application_id = ?";
      db.query(updateSql, [newStatus, application_id], (err, result) => {
        if (err) {
          console.log("Update application status error:", err);
          return res.status(500).json({ error: "Database error" });
        }
        res.json({ message: `Application ${action}d successfully` });
      });
    });
  });
});

module.exports = router;