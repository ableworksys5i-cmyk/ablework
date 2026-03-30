const db = require("../db/db");
const bcrypt = require("bcrypt");

// REGISTER
exports.register = async (req, res) => {
  const {
    name,
    username,
    email,
    password,
    role,
    disability_type,
    skills,
    location,
    latitude,
    longitude,
    education,
    preferred_job,
    company_name,
    company_address,
    contact_number
  } = req.body;

  const pwd_verification_file = req.file ? req.file.filename : null;

  if (!username || !email || !password || !role) {
    return res.json({ success: false, message: "Missing required fields." });
  }

  if (role === "applicant") {
    if (!name || !pwd_verification_file) {
      return res.json({ success: false, message: "Missing required fields for applicant." });
    }
  }

  if (role === "employer") {
    if (!company_name || !company_address || !contact_number) {
      return res.json({ success: false, message: "Missing required fields for employer." });
    }
  }

  const resolvedName = name || company_name || "Employer";

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (name, username, email, password, role)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [resolvedName, username, email, hashedPassword, role], (err, result) => {
      if (err) {
        console.log("User insert error:", err);
        if (err.code === "ER_DUP_ENTRY") {
          if (err.sqlMessage.includes("username")) {
            return res.json({ success: false, message: "Username already exists." });
          }
          if (err.sqlMessage.includes("email")) {
            return res.json({ success: false, message: "Email already exists." });
          }
        }
        return res.json({ success: false, message: "Register failed", error: err.message });
      }

      const user_id = result.insertId;

      if (role === "applicant") {
        const applicantSQL = `
          INSERT INTO applicants (
            user_id, 
            disability_type, 
            skills, 
            education, 
            preferred_job, 
            latitude, 
            longitude, 
            pwd_verification
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
          applicantSQL,
          [
            user_id,
            disability_type || "",
            skills || "",
            education || "",
            preferred_job || "",
            latitude || null,
            longitude || null,
            pwd_verification_file || ""
          ],
          (appErr) => {
            if (appErr) {
              console.log("Applicant insert error:", appErr);
              return res.json({
                success: false,
                message: "Applicant creation failed",
                error: appErr.message
              });
            }

            res.json({ success: true, message: "Registered successfully" });
          }
        );

      } else if (role === "employer") {
        const employerSQL = `
          INSERT INTO employers (user_id, company_name, company_address, contact_number, latitude, longitude)
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(
          employerSQL,
          [user_id, company_name || "", company_address || "", contact_number || "", latitude || null, longitude || null],
          (empErr) => {
            if (empErr) {
              console.log("Employer insert error:", empErr);
              return res.json({
                success: false,
                message: "Employer creation failed",
                error: empErr.message
              });
            }

            res.json({ success: true, message: "Registered successfully" });
          }
        );

      } else {
        res.json({ success: true, message: "Registered successfully" });
      }
    });

  } catch (error) {
    console.log("Hash error:", error);
    return res.json({ success: false, message: "Server error", error: error.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  const { username, password } = req.body;

  const sql = "SELECT * FROM users WHERE username=?";

  db.query(sql, [username], async (err, result) => {
    if (err) {
      console.log(err);
      return res.json({ success: false, message: "Server error" });
    }

    if (result.length === 0) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const user = result[0];
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    res.json({
      success: true,
      user_id: user.user_id,
      role: user.role,
      name: user.name,
      email: user.email
    });
  });
};