const db = require("../db/db");

exports.getApplications = (req, res) => {
  const { user_id } = req.params;

  // First get applicant_id from user_id
  const getApplicantSql = "SELECT applicant_id FROM applicants WHERE user_id = ?";
  
  db.query(getApplicantSql, [user_id], (err, applicantResult) => {
    if (err) {
      console.log("Get applicant error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (applicantResult.length === 0) {
      return res.json([]);
    }

    const applicant_id = applicantResult[0].applicant_id;

    const sql = `
      SELECT 
        j.job_title AS title, 
        j.job_description AS description,
        e.company_name AS company,
        a.status, 
        a.applied_at AS applied_date,
        a.application_id,
        j.job_id,
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
    `;

    db.query(sql, [applicant_id], (err, result) => {
      if (err) {
        console.log("Get applications error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(result);
    });
  });
};

exports.applyJob = (req, res) => {
  const { applicant_id, job_id, cover_letter, custom_resume } = req.body;

  console.log("\n=== APPLY FOR JOB ===");
  console.log("applicant_id:", applicant_id, "| job_id:", job_id);

  if (!applicant_id || !job_id) {
    console.log("❌ Missing required fields");
    return res.status(400).json({ error: "applicant_id and job_id are required" });
  }

  // First check if applicant already applied for this job
  const checkDuplicateSql = `
    SELECT application_id FROM applications 
    WHERE applicant_id = ? AND job_id = ?
  `;

  db.query(checkDuplicateSql, [applicant_id, job_id], (err, duplicateResult) => {
    if (err) {
      console.log("❌ Duplicate check error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (duplicateResult.length > 0) {
      console.log("⚠️ Already applied for this job");
      return res.status(409).json({ error: "You have already applied for this job" });
    }

    // Get the job details and employer info
    const getJobSql = `
      SELECT j.job_title, j.employer_id, e.company_name, e.user_id as employer_user_id, u.name as employer_name, u.user_id as emp_user_id
      FROM jobs j
      LEFT JOIN employers e ON j.employer_id = e.employer_id
      LEFT JOIN users u ON e.user_id = u.user_id
      WHERE j.job_id = ?
    `;

    db.query(getJobSql, [job_id], (err, jobResult) => {
      if (err) {
        console.log("❌ Get job error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (jobResult.length === 0) {
        console.log("❌ Job not found");
        return res.status(404).json({ error: "Job not found" });
      }

      const job = jobResult[0];
      console.log("✓ Job found:", job.job_title, "| employer_id:", job.employer_id);

      // Insert the application
      const applicationSql = `
        INSERT INTO applications (applicant_id, job_id, status, applied_at, cover_letter, custom_resume)
        VALUES (?, ?, 'pending', NOW(), ?, ?)
      `;

      db.query(applicationSql, [applicant_id, job_id, cover_letter || null, custom_resume || null], (err, result) => {
        if (err) {
          console.log("❌ Application insert error:", err);
          return res.status(500).json({ error: "Failed to create application" });
        }

        const application_id = result.insertId;
        console.log("✓ Application created - ID:", application_id);

        // Create a notification for the employer
        const notificationSql = `
          INSERT INTO notifications (employer_id, type, title, message, related_id, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;

        const notificationTitle = "New Application";
        const notificationMessage = `A new applicant has applied for ${job.job_title}`;
        const notificationType = "application";

        db.query(notificationSql, [job.employer_id, notificationType, notificationTitle, notificationMessage, application_id, 'unread'], (notifErr) => {
          if (notifErr) {
            console.log("⚠️ Notification insert error:", notifErr);
            // Still return success even if notification fails
          } else {
            console.log("✓ Notification created");
          }

          // Emit real-time update
          global.io.emit('applicationSubmitted', {
            application_id,
            job_id,
            applicant_id,
            employer_id: job.employer_id,
            job_title: job.job_title,
            company_name: job.company_name
          });
          console.log('Emitted applicationSubmitted event for application:', application_id);

          console.log("=== END APPLY FOR JOB ===\n");
          res.json({
            message: "Applied successfully",
            application_id: application_id,
            job_title: job.job_title,
            employer_id: job.employer_id,
            company_name: job.company_name
          });
        });
      });
    });
  });
};

exports.withdrawApplication = (req, res) => {
  const { applicationId } = req.params;

  const sql = `DELETE FROM applications WHERE application_id = ?`;

  db.query(sql, [applicationId], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json({ message: "Application withdrawn successfully" });
  });
};

// Update application status
exports.updateApplicationStatus = (req, res) => {
  const { applicationId } = req.params;
  const { status } = req.body;

  const sql = `UPDATE applications SET status = ? WHERE application_id = ?`;

  db.query(sql, [status, applicationId], (err, result) => {
    if (err) {
      console.log("Update application status error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Emit application status update event for real-time reloads
    global.io.emit('applicationStatusUpdated', {
      application_id: parseInt(applicationId, 10),
      status
    });
    console.log('Emitted applicationStatusUpdated event for application:', applicationId);

    res.json({ message: "Application status updated successfully" });
  });
};

// Schedule interview
exports.scheduleInterview = (req, res) => {
  const { applicationId } = req.params;
  const { interview_date, interview_time, interview_type, notes } = req.body;

  // First update status to 'interview'
  const updateStatusSql = `UPDATE applications SET status = ? WHERE application_id = ?`;
  db.query(updateStatusSql, ["interview", applicationId], (err) => {
    if (err) {
      console.log("Update status error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    // Then insert interview details
    const insertInterviewSql = `
      INSERT INTO interviews (application_id, interview_date, interview_time, interview_type, notes)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(insertInterviewSql, [applicationId, interview_date, interview_time, interview_type, notes], (err, result) => {
      if (err) {
        console.log("Insert interview error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      res.json({ message: "Interview scheduled successfully", interview_id: result.insertId });
    });
  });
};

// Send job offer
exports.sendJobOffer = (req, res) => {
  const { applicationId } = req.params;
  const { offer_salary, offer_benefits, joining_date, offer_letter } = req.body;

  const sql = `
    INSERT INTO job_offers (application_id, offer_salary, offer_benefits, joining_date, offer_letter, created_at)
    VALUES (?, ?, ?, ?, ?, NOW())
  `;

  db.query(sql, [applicationId, offer_salary, offer_benefits, joining_date, offer_letter], (err, result) => {
    if (err) {
      console.log("Send job offer error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json({ message: "Job offer sent successfully", offer_id: result.insertId });
  });
};