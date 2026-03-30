const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const db = require("../db/db");
const bcrypt = require("bcrypt");

// Helper to resolve employer_id from user_id
const getEmployerIdFromUser = (user_id, callback) => {
  const sql = "SELECT employer_id FROM employers WHERE user_id = ?";
  db.query(sql, [user_id], (err, rows) => {
    if (err) return callback(err);
    if (!rows || rows.length === 0) return callback(null, null);
    callback(null, rows[0].employer_id);
  });
};

// Logo upload setup
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/logos"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const logoUpload = multer({
  storage: logoStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit for logos
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."));
    }
  }
});

// Get employer profile by user_id
router.get("/:user_id", (req, res) => {
  const { user_id } = req.params;

  const sql = `
    SELECT
      u.name,
      u.email,
      u.username,
      e.company_name,
      e.company_address,
      e.contact_number,
      e.latitude,
      e.longitude,
      e.logo
    FROM users u
    LEFT JOIN employers e ON u.user_id = e.user_id
    WHERE u.user_id = ?
  `;

  db.query(sql, [user_id], (err, result) => {
    if (err) {
      console.log("Employer query error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "Employer not found" });
    }

    res.json(result[0]);
  });
});

// Update employer profile
router.put("/:user_id", (req, res) => {
  const { user_id } = req.params;
  const { email, username, company_name, company_address, contact_number } = req.body;

  // Update users table (email + username only)
  const userSql = `UPDATE users SET email = ?, username = ? WHERE user_id = ?`;
  db.query(userSql, [email, username, user_id], (err, userResult) => {
    if (err) {
      console.log("Update user error:", err);
      return res.status(500).json({ error: "Database error updating user" });
    }

    // Update employers table
    const employerSql = `UPDATE employers SET company_name = ?, company_address = ?, contact_number = ? WHERE user_id = ?`;
    db.query(employerSql, [company_name, company_address, contact_number, user_id], (err, employerResult) => {
      if (err) {
        console.log("Update employer error:", err);
        return res.status(500).json({ error: "Database error updating employer" });
      }

      res.json({ message: "Profile updated successfully" });
    });
  });
});

// Upload employer logo
router.post("/:user_id/logo", logoUpload.single("logo_file"), (req, res) => {
  const user_id = req.params.user_id;
  const logoFileName = req.file ? req.file.filename : null;

  if (!logoFileName) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const sql = "UPDATE employers SET logo = ? WHERE user_id = ?";
  db.query(sql, [logoFileName, user_id], (err) => {
    if (err) {
      console.log("Logo upload error:", err);
      return res.status(500).json({ message: "Failed to update logo" });
    }
    return res.json({ message: "Logo uploaded successfully", logo: logoFileName });
  });
});

// Get employer job postings
router.get("/:user_id/jobs", (req, res) => {
  const { user_id } = req.params;

  getEmployerIdFromUser(user_id, (err, employer_id) => {
    if (err) {
      console.log("Employer jobs lookup error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (!employer_id) {
      return res.status(404).json({ error: "Employer not found" });
    }

    console.log('Employer jobs query =', employer_id);
    const sql = `SELECT j.job_id, j.job_title AS title, j.job_description AS description, j.job_category AS category, j.location, j.latitude, j.longitude, j.status, j.created_at FROM jobs j WHERE j.employer_id = ? ORDER BY j.created_at DESC`;
    console.log('Employer jobs SQL:', sql);
    db.query(sql, [employer_id], (err, result) => {
      if (err) {
        console.log("Employer jobs query error:", err);
        return res.status(500).json({ error: "Database error", details: err.message });
      }

      // Ensure jobs have fallback values for missing (legacy) columns
      const normalized = result.map(job => ({
        ...job,
        requirements: job.requirements || "",
        salary: job.salary || "",
        job_type: job.job_type || "full-time",
        job_radius: job.job_radius || 10,
        applicants_count: job.applicants_count || 0
      }));

      res.json(normalized);
    });
  });
});

// Create new employer job posting
router.post("/:user_id/jobs", (req, res) => {
  const { user_id } = req.params;
  const { title, description, location, latitude, longitude, category, status } = req.body;

  getEmployerIdFromUser(user_id, (err, employer_id) => {
    if (err) {
      console.log("Create job lookup error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (!employer_id) {
      return res.status(404).json({ error: "Employer not found" });
    }

    const sql = `INSERT INTO jobs (employer_id, job_title, job_description, job_category, location, latitude, longitude, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

    db.query(sql, [
      employer_id,
      title,
      description,
      category,
      location,
      latitude || null,
      longitude || null,
      status || 'active'
    ], (err, result) => {
      if (err) {
        console.log("Create job error:", err);
        return res.status(500).json({ error: "Database error", details: err.message });
      }
      res.json({ message: "Job created", job_id: result.insertId });
    });
  });
});

// Update employer job posting
router.put("/:user_id/jobs/:job_id", (req, res) => {
  const { user_id, job_id } = req.params;
  const { title, description, location, latitude, longitude, category, status } = req.body;

  getEmployerIdFromUser(user_id, (err, employer_id) => {
    if (err) {
      console.log("Update job lookup error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (!employer_id) {
      return res.status(404).json({ error: "Employer not found" });
    }

    const sql = `UPDATE jobs SET job_title = ?, job_description = ?, job_category = ?, location = ?, latitude = ?, longitude = ?, status = ? WHERE job_id = ? AND employer_id = ?`;

    db.query(sql, [
      title,
      description,
      category,
      location,
      latitude || null,
      longitude || null,
      status || "active",
      job_id,
      employer_id
    ], (err, result) => {
      if (err) {
        console.log("Update job error:", err);
        return res.status(500).json({ error: "Database error", details: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Job not found or not authorized" });
      }
      res.json({ message: "Job updated successfully" });
    });
  });
});

// Get applicants for all employer's jobs
router.get("/:user_id/applications", (req, res) => {
  const { user_id } = req.params;

  getEmployerIdFromUser(user_id, (err, employer_id) => {
    if (err) {
      console.log("Employer applications lookup error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (!employer_id) {
      return res.status(404).json({ error: "Employer not found" });
    }

    const sql = `
      SELECT a.application_id, a.job_id, j.job_title AS job_title, u.name AS applicant_name, u.email AS applicant_email, a.status, a.applied_at
      FROM applications a
      JOIN jobs j ON a.job_id = j.job_id
      JOIN users u ON a.applicant_id = u.user_id
      WHERE j.employer_id = ?
      ORDER BY a.applied_at DESC
    `;

    db.query(sql, [employer_id], (err, result) => {
      if (err) {
        console.log("Employer applications query error:", err);
        return res.status(500).json({ error: "Database error", details: err.message });
      }
      res.json(result);
    });
  });
});

// Update employer password
router.put("/:user_id/password", async (req, res) => {
  const { user_id } = req.params;
  const { new_password, confirm_password } = req.body;

  if (new_password !== confirm_password) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  if (!new_password || new_password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  try {
    const hashedPassword = await bcrypt.hash(new_password, 10);
    
    const sql = `UPDATE users SET password = ? WHERE user_id = ?`;
    db.query(sql, [hashedPassword, user_id], (err, result) => {
      if (err) {
        console.log("Update password error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      res.json({ message: "Password updated successfully" });
    });
  } catch (error) {
    console.log("Password hashing error:", error);
    return res.status(500).json({ error: "Error updating password" });
  }
});

module.exports = router;