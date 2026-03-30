const db = require("../db/db");

exports.getStats = (req, res) => {
  const { user_id } = req.params;

  // First get the applicant and user data to calculate completion
  const applicantSql = `
    SELECT users.name, users.email, applicants.disability_type, applicants.skills, applicants.education, applicants.preferred_job, applicants.pwd_verification, applicants.latitude, applicants.longitude
    FROM applicants
    JOIN users ON users.user_id = applicants.user_id
    WHERE applicants.user_id = ?
  `;

  db.query(applicantSql, [user_id], (err, applicantResult) => {
    if (err) return res.status(500).json(err);

    const applicant = applicantResult[0];
    let completionScore = 0;
    const totalFields = 6; // name/email, disability_type, skills, education, preferred_job, resume verification

    if (applicant) {
      if (applicant.name) completionScore++;
      if (applicant.email) completionScore++;
      if (applicant.disability_type) completionScore++;
      if (applicant.skills) completionScore++;
      if (applicant.education) completionScore++;
      if (applicant.preferred_job) completionScore++;
      if (applicant.pwd_verification) completionScore++;
    }

    const profileCompletion = Math.round((completionScore / totalFields) * 100);

    const sql = `
      SELECT 
        (SELECT COUNT(*) FROM applications WHERE applicant_id = ?) AS applications,
        0 AS saved,
        ? AS profile_completion
    `;

    db.query(sql, [user_id, profileCompletion], (err, result) => {
      if (err) return res.json(err);
      res.json(result[0]);
    });
  });
};