const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");
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

// Profile picture upload setup
const profilePicStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/profile_pictures"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const profilePicUpload = multer({
  storage: profilePicStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."));
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

    // Update applicants table; no latitude/longitude stored here anymore
    const applicantSql = `UPDATE applicants SET disability_type = ?, skills = ?, education = ?, preferred_job = ? WHERE user_id = ?`;
    db.query(applicantSql, [disability_type, skills, education, preferred_job, user_id], (err, applicantResult) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Database error updating applicant" });
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

// UPDATE APPLICANT PASSWORD
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
        return res.status(500).json({ error: "Database error", details: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Applicant user not found" });
      }
      res.json({ message: "Password updated successfully" });
    });
  } catch (error) {
    console.log("Password hashing error:", error);
    return res.status(500).json({ error: "Error updating password" });
  }
});

// ===== SAVED JOBS ROUTES (MUST COME BEFORE /:user_id ROUTE) =====

// SAVE A JOB FOR APPLICANT
router.post("/saved-jobs/:applicant_id/:job_id", (req, res) => {
  const { applicant_id, job_id } = req.params;
  console.log("\n=== SAVE JOB REQUEST ===");
  console.log("Applicant ID:", applicant_id, "| Job ID:", job_id);

  // Insert into saved jobs (ignore if already exists due to UNIQUE constraint)
  const saveSql = "INSERT IGNORE INTO applicant_saved_jobs (applicant_id, job_id) VALUES (?, ?)";
  db.query(saveSql, [applicant_id, job_id], (err, result) => {
    if (err) {
      console.log("❌ Save job error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (result.affectedRows === 0) {
      console.log("⚠️ Job already saved - applicant_id:", applicant_id, "job_id:", job_id);
      return res.status(409).json({ message: "Job already saved" });
    }
    console.log("✓ Job saved - applicant_id:", applicant_id, "job_id:", job_id);
    console.log("=== END SAVE JOB REQUEST ===\n");
    res.json({ message: "Job saved successfully" });
  });
});

// GET SAVED JOBS FOR APPLICANT (using applicant_id directly)
router.get("/saved-jobs/:applicant_id", (req, res) => {
  const { applicant_id } = req.params;
  console.log("\n=== GET SAVED JOBS REQUEST ===");
  console.log("Applicant ID:", applicant_id);

  // Get saved jobs with job details and company name
  const savedJobsSql = `
    SELECT j.job_id, j.job_title AS title, j.job_description AS description, 
           j.job_category AS category, j.location, j.latitude, j.longitude, 
           j.status, j.requirements, j.salary, j.job_type, j.job_radius,
           j.created_at, e.company_name AS company, sj.saved_at
    FROM applicant_saved_jobs sj
    JOIN jobs j ON sj.job_id = j.job_id
    LEFT JOIN employers e ON j.employer_id = e.employer_id
    WHERE sj.applicant_id = ?
    ORDER BY sj.saved_at DESC
  `;
  
  db.query(savedJobsSql, [applicant_id], (err, result) => {
    if (err) {
      console.log("❌ Get saved jobs error:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }
    console.log("✓ Saved jobs retrieved:", result.length, "for applicant_id:", applicant_id);
    if (result.length > 0) {
      console.log("  First job:", result[0].job_id, "-", result[0].title);
    }
    console.log("=== END SAVED JOBS REQUEST ===\n");
    res.json(result);
  });
});

// UNSAVE A JOB FOR APPLICANT
router.delete("/saved-jobs/:applicant_id/:job_id", (req, res) => {
  const { applicant_id, job_id } = req.params;
  console.log("\n=== DELETE SAVED JOB REQUEST ===");
  console.log("Applicant ID:", applicant_id, "| Job ID:", job_id);

  // Delete from saved jobs
  const unsaveSql = "DELETE FROM applicant_saved_jobs WHERE applicant_id = ? AND job_id = ?";
  db.query(unsaveSql, [applicant_id, job_id], (err, result) => {
    if (err) {
      console.log("❌ Unsave job error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (result.affectedRows === 0) {
      console.log("❌ Job not saved for this applicant");
      return res.status(404).json({ message: "Job not saved" });
    }
    console.log("✓ Job unsaved successfully");
    console.log("=== END DELETE SAVED JOB REQUEST ===\n");
    res.json({ message: "Job unsaved successfully" });
  });
});

// ===== END SAVED JOBS ROUTES =====

// UPLOAD PROFILE PICTURE (MUST COME BEFORE GENERIC /:user_id ROUTES)
router.post("/:user_id/profile-picture", profilePicUpload.single("profile_picture"), (req, res) => {
  const user_id = req.params.user_id;
  
  console.log("Profile picture upload request for user_id:", user_id);
  console.log("File details:", req.file);
  
  if (!req.file) {
    console.error("No file uploaded");
    return res.status(400).json({ message: "No file uploaded", error: "File not received by server" });
  }

  const profilePicFileName = req.file.filename;

  const sql = "UPDATE applicants SET profile_picture = ? WHERE user_id = ?";
  db.query(sql, [profilePicFileName, user_id], (err) => {
    if (err) {
      console.error("Database error updating profile picture:", err);
      return res.status(500).json({ message: "Failed to update profile picture", error: err.message });
    }
    console.log("Profile picture updated successfully for user_id:", user_id);
    return res.json({ message: "Profile picture uploaded successfully", profile_picture: profilePicFileName });
  });
});

// GET APPLICANT STATS
router.get("/stats/:user_id", applicantController.getStats);

// GET APPLICANT PROFILE
router.get("/:user_id", (req, res) => {
  const user_id = req.params.user_id;
  console.log("\n=== GET APPLICANT PROFILE ===");
  console.log("User ID:", user_id);

  const sql = `
    SELECT users.name, users.email, users.username,
    applicants.applicant_id, applicants.disability_type, applicants.skills, applicants.education,
    applicants.preferred_job, applicants.profile_picture,
    applicants.pwd_verification
    FROM users
    JOIN applicants ON users.user_id = applicants.user_id
    WHERE users.user_id = ?
  `;

  db.query(sql, [user_id], (err, result) => {
    if (err) {
      console.log("❌ Database error:", err);
      return res.json({ message: "Database error" });
    }

    if (result.length === 0) {
      console.log("❌ No applicant found for user_id:", user_id);
      return res.json({ message: "Applicant not found" });
    }

    console.log("✓ Applicant found - ID:", result[0].applicant_id);
    res.json(result[0]);
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

// DEBUG: Check if user exists and has applicant record
router.get("/:user_id/debug", (req, res) => {
  const { user_id } = req.params;
  console.log("\n=== DEBUG USER/APPLICANT ===");
  console.log("Checking user_id:", user_id);

  // Check users table
  const userSql = "SELECT user_id, role FROM users WHERE user_id = ?";
  db.query(userSql, [user_id], (err, userResult) => {
    if (err) {
      console.log("❌ User query error:", err);
      return res.json({ error: err });
    }

    if (userResult.length === 0) {
      console.log("❌ User not found");
      return res.json({ user_found: false, applicant_found: false });
    }

    console.log("✓ User found, role:", userResult[0].role);

    // Check applicants table
    const applicantSql = "SELECT applicant_id FROM applicants WHERE user_id = ?";
    db.query(applicantSql, [user_id], (err, applicantResult) => {
      if (err) {
        console.log("❌ Applicant query error:", err);
        return res.json({ user_found: true, applicant_query_error: err });
      }

      if (applicantResult.length === 0) {
        console.log("❌ Applicant record not found for this user");
        return res.json({ user_found: true, applicant_found: false });
      }

      const applicant_id = applicantResult[0].applicant_id;
      console.log("✓ Applicant found - ID:", applicant_id);

      // Check saved jobs
      const savedSql = "SELECT COUNT(*) as count FROM applicant_saved_jobs WHERE applicant_id = ?";
      db.query(savedSql, [applicant_id], (err, savedResult) => {
        if (err) {
          console.log("❌ Saved jobs query error:", err);
          return res.json({ 
            user_found: true, 
            applicant_found: true, 
            applicant_id,
            saved_jobs_query_error: err 
          });
        }

        const count = savedResult[0].count;
        console.log("✓ Saved jobs count:", count);
        console.log("=== END DEBUG ===\n");

        res.json({ 
          user_found: true, 
          applicant_found: true, 
          applicant_id,
          saved_jobs_count: count
        });
      });
    });
  });
});

// Get notifications for applicant
router.get("/:user_id/notifications", (req, res) => {
  const { user_id } = req.params;

  console.log(`Getting notifications for applicant user_id: ${user_id}`);

  // First get applicant_id and skills from user_id
  const getApplicantSql = "SELECT applicant_id, skills FROM applicants WHERE user_id = ?";
  
  db.query(getApplicantSql, [user_id], (err, applicantResult) => {
    if (err) {
      console.log("Applicant notifications lookup error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (applicantResult.length === 0) {
      console.log("Applicant not found for user_id:", user_id);
      return res.status(404).json({ error: "Applicant not found" });
    }

    const applicant_id = applicantResult[0].applicant_id;
    const applicantSkills = applicantResult[0].skills;
    console.log(`Found applicant_id: ${applicant_id}`);

    // Query 1: Get application status notifications
    const notificationsSql = `
      SELECT 
        a.application_id,
        a.status,
        a.applied_at,
        j.job_title,
        e.company_name,
        i.interview_date,
        i.interview_time,
        i.interview_type,
        i.notes AS interview_notes
      FROM applications a
      JOIN jobs j ON a.job_id = j.job_id
      LEFT JOIN employers e ON j.employer_id = e.employer_id
      LEFT JOIN interviews i ON i.interview_id = (
        SELECT MAX(interview_id) FROM interviews WHERE application_id = a.application_id
      )
      WHERE a.applicant_id = ?
      ORDER BY a.applied_at DESC
      LIMIT 10
    `;

    db.query(notificationsSql, [applicant_id], (err, applications) => {
      if (err) {
        console.log("Applicant notifications query error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      let notifications = applications.map((app) => {
        const jobLabel = app.job_title ? `for ${app.job_title}` : "";
        const companyLabel = app.company_name ? ` at ${app.company_name}` : "";
        let type = "application_update";
        let title = "Application Update";
        let message = `Your application ${jobLabel}${companyLabel} is currently ${app.status}.`;

        if (app.status === "accepted") {
          type = "offer";
          title = "🎉 Application Accepted!";
          message = `Great news! Your application ${jobLabel}${companyLabel} has been accepted.`;
        } else if (app.status === "rejected") {
          type = "rejection";
          title = "Application Status";
          message = `Your application ${jobLabel}${companyLabel} was not successful. Keep applying!`;
        } else if (app.status === "shortlisted") {
          type = "application_update";
          title = "⭐ You Have Been Shortlisted";
          message = `Great news! Your application ${jobLabel}${companyLabel} has been shortlisted. The employer may schedule an interview soon.`;
        } else if (app.status === "interviewed" || app.status === "interview") {
          type = "interview_invite";
          title = "📅 Interview Scheduled";
          message = `An interview has been scheduled ${jobLabel}${companyLabel}.`;
          if (app.interview_notes) {
            message += ` Please bring: ${app.interview_notes}`;
          }
        } else if (app.status === "reviewed") {
          type = "application_update";
          title = "✓ Application Reviewed";
          message = `Your application ${jobLabel}${companyLabel} has been reviewed.`;
        } else if (app.status === "pending") {
          type = "application_update";
          title = "📤 Application Submitted";
          message = `Your application ${jobLabel}${companyLabel} has been submitted.`;
        }

        return {
          id: `app_${app.application_id}`,
          type,
          title,
          message,
          date: app.applied_at,
          jobTitle: app.job_title,
          company: app.company_name,
          related_id: app.application_id,
          read: false
        };
      });

      // Query 2: Get recently posted jobs (last 7 days)
      const recentJobsSql = `
        SELECT j.job_id, j.job_title, j.created_at, e.company_name
        FROM jobs j
        LEFT JOIN employers e ON j.employer_id = e.employer_id
        WHERE j.status = 'active' AND j.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ORDER BY j.created_at DESC
        LIMIT 5
      `;

      db.query(recentJobsSql, (err, recentJobs) => {
        if (!err && recentJobs && recentJobs.length > 0) {
          const jobNotifications = recentJobs.map((job, index) => ({
            id: `job_${job.job_id}`,
            type: "new_job",
            title: `💼 New Job: ${job.job_title}`,
            message: `A new job "${job.job_title}" ${job.company_name ? `at ${job.company_name}` : ""} was just posted.`,
            date: job.created_at,
            jobTitle: job.job_title,
            company: job.company_name,
            read: false
          }));
          notifications = [...notifications, ...jobNotifications];
        }

        // Sort all notifications by date (newest first)
        notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

        // If no notifications, add welcome messages
        if (notifications.length === 0) {
          notifications = [
            {
              id: 1,
              type: "welcome",
              title: "👋 Welcome to ABLEWORK!",
              message: "Welcome to our inclusive employment platform! Start exploring jobs that match your skills.",
              date: new Date().toISOString(),
              read: false
            },
            {
              id: 2,
              type: "tip",
              title: "💡 Pro Tip",
              message: "Complete your profile and upload your resume to get better job matches.",
              date: new Date(Date.now() - 86400000).toISOString(),
              read: false
            }
          ];
        }

        console.log(`Returning ${notifications.length} notifications for applicant ${applicant_id}`);
        res.json(notifications);
      });
    });
  });
});

// Multer error handler middleware
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error("Multer error:", err);
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(400).json({ message: "File is too large", error: err.message });
    }
    return res.status(400).json({ message: "File upload error", error: err.message });
  } else if (err) {
    console.error("Upload error:", err);
    return res.status(400).json({ message: "Upload error", error: err.message });
  }
  next();
});

module.exports = router;