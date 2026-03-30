const db = require("../db/db");

exports.getApplications = (req, res) => {
  const { user_id } = req.params;

  const sql = `
    SELECT 
      j.job_title AS title, 
      j.job_description AS description,
      e.company_name AS company,
      a.status, 
      a.applied_at AS applied_date,
      a.application_id,
      j.job_id
    FROM applications a
    JOIN jobs j ON a.job_id = j.job_id
    LEFT JOIN employers e ON j.employer_id = e.employer_id
    WHERE a.applicant_id = ?
    ORDER BY a.applied_at DESC
  `;

  db.query(sql, [user_id], (err, result) => {
    if (err) return res.json(err);
    res.json(result);
  });
};

exports.applyJob = (req, res) => {
  const { user_id, job_id } = req.body;

  // First get the job details and employer info
  const getJobSql = `
    SELECT j.job_title, j.employer_id, e.company_name, u.name as employer_name
    FROM jobs j
    LEFT JOIN employers e ON j.employer_id = e.employer_id
    LEFT JOIN users u ON e.user_id = u.user_id
    WHERE j.job_id = ?
  `;

  db.query(getJobSql, [job_id], (err, jobResult) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (jobResult.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    const job = jobResult[0];

    // Insert the application
    const sql = `
      INSERT INTO applications (applicant_id, job_id, status, applied_at)
      VALUES (?, ?, 'pending', NOW())
    `;

    db.query(sql, [user_id, job_id], (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });

      // Create a notification for the employer (this would be stored in a notifications table in a real app)
      // For now, we'll just return success and the frontend can handle notifications
      res.json({
        message: "Applied successfully",
        job_title: job.job_title,
        employer_id: job.employer_id,
        company_name: job.company_name
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

    res.json({ message: "Application status updated successfully" });
  });
};

// Schedule interview
exports.scheduleInterview = (req, res) => {
  const { applicationId } = req.params;
  const { interview_date, interview_time, interview_type, notes } = req.body;

  // First update status to 'interviewed'
  const updateStatusSql = `UPDATE applications SET status = ? WHERE application_id = ?`;
  db.query(updateStatusSql, ["interviewed", applicationId], (err) => {
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