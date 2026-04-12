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
      e.company_website,
      e.logo,
      e.verification_document
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
  const { email, username, company_name, company_address, contact_number, company_website, latitude, longitude } = req.body;

  console.log("=== UPDATE PROFILE ===");
  console.log("company_website:", company_website, "(type:", typeof company_website, ")");
  console.log("=== END ===");

  // Update users table (email + username only)
  const userSql = `UPDATE users SET email = ?, username = ? WHERE user_id = ?`;
  db.query(userSql, [email, username, user_id], (err, userResult) => {
    if (err) {
      console.log("Update user error:", err);
      return res.status(500).json({ error: "Database error updating user" });
    }

    // Update employers table
    const employerSql = `UPDATE employers SET company_name = ?, company_address = ?, contact_number = ?, company_website = ? WHERE user_id = ?`;
    db.query(employerSql, [company_name, company_address, contact_number, (company_website && company_website.trim()) ? company_website.trim() : null, user_id], (err, employerResult) => {
      if (err) {
        console.log("Update employer error:", err);
        return res.status(500).json({ error: "Database error updating employer" });
      }

      if (latitude && longitude) {
        const locSql = "INSERT INTO user_locations (user_id, latitude, longitude) VALUES (?, ?, ?)";
        db.query(locSql, [user_id, latitude, longitude], (locErr) => {
          if (locErr) {
            console.log("User location insert error:", locErr);
          }
          res.json({ message: "Profile updated successfully" });
        });
      } else {
        res.json({ message: "Profile updated successfully" });
      }
    });
  });
});

// Upload employer logo
router.post("/:user_id/logo", (req, res) => {
  logoUpload.single("logo_file")(req, res, (err) => {
    if (err) {
      console.log("Multer error:", err);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: "File too large. Maximum size is 2MB." });
        }
      }
      return res.status(400).json({ message: err.message || "File upload error" });
    }

    const user_id = req.params.user_id;
    const logoFileName = req.file ? req.file.filename : null;

    console.log("Logo upload attempt:");
    console.log("User ID:", user_id);
    console.log("File:", req.file);
    console.log("File name:", logoFileName);

    if (!logoFileName) {
      console.log("No file uploaded - req.file is null or undefined");
      return res.status(400).json({ message: "No file uploaded" });
    }

    const sql = "UPDATE employers SET logo = ? WHERE user_id = ?";
    console.log("Executing SQL:", sql, "with params:", [logoFileName, user_id]);

    db.query(sql, [logoFileName, user_id], (err, result) => {
      if (err) {
        console.log("Logo upload database error:", err);
        return res.status(500).json({ message: "Failed to update logo" });
      }

      console.log("Logo upload successful, result:", result);
      return res.json({ message: "Logo uploaded successfully", logo: logoFileName });
    });
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
    const sql = `SELECT j.job_id, j.job_title AS title, j.job_description AS description, j.job_category AS category, j.location, j.latitude, j.longitude, j.status, j.requirements, j.required_skills, j.salary, j.job_type, j.job_radius, j.created_at, COUNT(a.application_id) AS applicants_count FROM jobs j LEFT JOIN applications a ON j.job_id = a.job_id WHERE j.employer_id = ? GROUP BY j.job_id ORDER BY j.created_at DESC`;
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
        job_radius: job.job_radius || 10
      }));

      res.json(normalized);
    });
  });
});

// Create new employer job posting
router.post("/:user_id/jobs", (req, res) => {
  const { user_id } = req.params;
  const { title, description, requirements, required_skills, location, latitude, longitude, category, status, salary, job_type } = req.body;
  const DEFAULT_JOB_RADIUS = 10;
  
  console.log("=== CREATE JOB ===" );
  console.log("required_skills:", required_skills, "(type:", typeof required_skills, ")");
  console.log("=== END ===");

  getEmployerIdFromUser(user_id, (err, employer_id) => {
    if (err) {
      console.log("Create job lookup error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (!employer_id) {
      return res.status(404).json({ error: "Employer not found" });
    }

    if (!requirements || !requirements.trim()) {
      return res.status(400).json({ error: "Job requirements are required for employer verification." });
    }

    const sql = `INSERT INTO jobs (employer_id, job_title, job_description, job_category, location, latitude, longitude, status, requirements, required_skills, salary, job_type, job_radius, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

    const processedSkills = (required_skills && required_skills.trim()) ? required_skills.trim() : null;
    console.log("Inserting job with required_skills:", processedSkills);

    db.query(sql, [
      employer_id,
      title,
      description,
      category,
      location,
      latitude || null,
      longitude || null,
      status || 'active',
      requirements,
      processedSkills,
      salary || null,
      job_type || 'full-time',
      DEFAULT_JOB_RADIUS
    ], (err, result) => {
      if (err) {
        console.log("Create job error:", err);
        return res.status(500).json({ error: "Database error", details: err.message });
      }
      console.log("Job created successfully with ID:", result.insertId);
      
      // Emit real-time update
      global.io.emit('jobPosted', {
        job_id: result.insertId,
        employer_id,
        title,
        category,
        location,
        latitude,
        longitude
      });
      console.log('Emitted jobPosted event for job:', result.insertId);
      
      res.json({ message: "Job created", job_id: result.insertId });
    });
  });
});

// Update employer job posting
router.put("/:user_id/jobs/:job_id", (req, res) => {
  const { user_id, job_id } = req.params;
  const { title, description, requirements, required_skills, location, latitude, longitude, category, status, salary, job_type } = req.body;
  const DEFAULT_JOB_RADIUS = 10;

  getEmployerIdFromUser(user_id, (err, employer_id) => {
    if (err) {
      console.log("Update job lookup error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (!employer_id) {
      return res.status(404).json({ error: "Employer not found" });
    }

    if (!requirements || !requirements.trim()) {
      return res.status(400).json({ error: "Job requirements are required for employer verification." });
    }

    const sql = `UPDATE jobs SET job_title = ?, job_description = ?, job_category = ?, location = ?, latitude = ?, longitude = ?, status = ?, requirements = ?, required_skills = ?, salary = ?, job_type = ?, job_radius = ? WHERE job_id = ? AND employer_id = ?`;

    const processedSkills = (required_skills && required_skills.trim()) ? required_skills.trim() : null;
    console.log("Updating job with required_skills:", processedSkills);

    db.query(sql, [
      title,
      description,
      category,
      location,
      latitude || null,
      longitude || null,
      status || "active",
      requirements,
      processedSkills,
      salary || null,
      job_type || 'full-time',
      DEFAULT_JOB_RADIUS,
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
      // Emit job update event for real-time reloads
      global.io.emit('jobUpdated', {
        job_id: parseInt(job_id, 10),
        employer_id,
        title,
        category,
        location,
        latitude,
        longitude,
        status,
        salary,
        job_type
      });
      console.log('Emitted jobUpdated event for job:', job_id);
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
      SELECT a.application_id, a.job_id, a.applicant_id, j.job_title AS job_title, u.name AS applicant_name, u.email AS applicant_email, a.status, a.applied_at, ap.pwd_verification, ap.pwd_verification_status, ap.skills, ap.education, ap.disability_type, a.cover_letter, a.custom_resume, j.latitude AS job_latitude, j.longitude AS job_longitude, ul.latitude AS applicant_latitude, ul.longitude AS applicant_longitude, j.requirements, i.interview_date, i.interview_time, i.interview_type, i.notes AS interview_notes
      FROM applications a
      JOIN jobs j ON a.job_id = j.job_id
      JOIN applicants ap ON a.applicant_id = ap.applicant_id
      JOIN users u ON ap.user_id = u.user_id
      LEFT JOIN user_locations ul ON u.user_id = ul.user_id
      LEFT JOIN interviews i ON i.interview_id = (
        SELECT MAX(interview_id) FROM interviews WHERE application_id = a.application_id
      )
      WHERE j.employer_id = ?
      ORDER BY a.applied_at DESC
    `;

    db.query(sql, [employer_id], (err, result) => {
      if (err) {
        console.log("Employer applications query error:", err);
        return res.status(500).json({ error: "Database error", details: err.message });
      }

      console.log(`✓ Found ${result.length} applications for employer ${employer_id}`);

      // Calculate match_score and distance for each application
      const enrichedResult = result.map(app => {
        let match_score = 0;
        let distance = 0;

        if (app.applicant_latitude && app.applicant_longitude && app.job_latitude && app.job_longitude) {
          // Calculate distance using Haversine formula
          const toRad = (deg) => (deg * Math.PI) / 180;
          const R = 6371; // Earth's radius in km
          const lat1 = parseFloat(app.applicant_latitude);
          const lon1 = parseFloat(app.applicant_longitude);
          const lat2 = parseFloat(app.job_latitude);
          const lon2 = parseFloat(app.job_longitude);

          const dLat = toRad(lat2 - lat1);
          const dLon = toRad(lon2 - lon1);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          distance = Math.round(R * c);

          // Calculate skill match
          const calculateSkillMatch = (jobSkillsStr, applicantSkills) => {
            if (!jobSkillsStr) return 0;
            const jobSkills = jobSkillsStr
              .split(",")
              .map((s) => s.trim().toLowerCase());
            const applicantSkillsArray = applicantSkills
              ? applicantSkills.split(",").map((s) => s.trim().toLowerCase())
              : [];
            const matches = jobSkills.filter((skill) =>
              applicantSkillsArray.some(
                (appSkill) =>
                  appSkill.includes(skill) || skill.includes(appSkill)
              )
            ).length;
            return matches > 0 ? (matches / jobSkills.length) * 100 : 0;
          };

          const skillMatchPercentage = calculateSkillMatch(
            app.requirements,
            app.skills
          );
          const isLocationMatch = distance <= 50;
          match_score = Math.round(
            skillMatchPercentage + (isLocationMatch ? 50 : 0)
          );
        }

        return {
          ...app,
          match_score,
          distance
        };
      });

      res.json(enrichedResult);
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

// Update PWD verification status for an applicant
router.put("/:user_id/applicants/:applicant_id/pwd-verification", (req, res) => {
  const { user_id, applicant_id } = req.params;
  const { status } = req.body; // 'approved' or 'rejected'

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: "Status must be 'approved' or 'rejected'" });
  }

  getEmployerIdFromUser(user_id, (err, employer_id) => {
    if (err) {
      console.log("Employer lookup error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (!employer_id) {
      return res.status(404).json({ error: "Employer not found" });
    }

    // Update PWD verification status
    const updateSql = `UPDATE applicants SET pwd_verification_status = ? WHERE applicant_id = ?`;
    
    db.query(updateSql, [status, applicant_id], (err, result) => {
      if (err) {
        console.log("Update PWD verification status error:", err);
        return res.status(500).json({ error: "Database error", details: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Applicant not found" });
      }

      res.json({ message: `PWD verification ${status} successfully` });
    });
  });
});

// Get notifications for employer
router.get("/:user_id/notifications", (req, res) => {
  const { user_id } = req.params;

  getEmployerIdFromUser(user_id, (err, employer_id) => {
    if (err) {
      console.log("Employer notifications lookup error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (!employer_id) {
      return res.status(404).json({ error: "Employer not found" });
    }

    const sql = `
      SELECT notification_id as id, type, title, message, related_id, status, created_at as date
      FROM notifications
      WHERE employer_id = ?
      ORDER BY created_at DESC
    `;

    db.query(sql, [employer_id], (err, result) => {
      if (err) {
        console.log("Employer notifications query error:", err);
        return res.status(500).json({ error: "Database error", details: err.message });
      }
      res.json(result);
    });
  });
});

module.exports = router;