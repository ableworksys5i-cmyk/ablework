const db = require('../db/db');

const createApplicant = (data, callback) => {
    const sql = "INSERT INTO applicants (user_id, disability_type, skills, education, preferred_job) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, data, callback);
};

module.exports = { createApplicant };