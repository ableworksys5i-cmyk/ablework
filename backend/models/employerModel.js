const db = require('../db/db');

const createEmployer = (data, callback) => {
    const sql = "INSERT INTO employers (user_id, company_name, company_address, contact_number, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, data, callback);
};

module.exports = { createEmployer };