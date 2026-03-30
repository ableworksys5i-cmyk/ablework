const db = require("../db/db");
 const createUser = (data, callback) => {
    const sql = "INSERT INTO users (name, username, email, password, role) VALUES (?, ?, ?, ?, ? )";
    db.query(sql, data, callback);
};

module.exports = {createUser};