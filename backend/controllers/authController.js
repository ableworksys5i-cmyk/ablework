const db = require("../db/db");
const bcrypt = require("bcrypt");
const { generateVerificationCode } = require("../middleware/security");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../services/emailService");

// REGISTER
exports.register = async (req, res) => {
  console.log("Registration request received");
  console.log("req.body:", req.body);
  console.log("req.file:", req.file);

  const {
    name,
    username,
    email,
    password,
    role,
    disability_type,
    skills,
    location,
    education,
    preferred_job,
    company_name,
    company_address,
    contact_number,
    company_website
  } = req.body;

  // Extract latitude/longitude for user_locations record only
  const rawLatitude = req.body.latitude;
  const rawLongitude = req.body.longitude;
  const locationString = location || "";

  const parsedLatitude = rawLatitude != null && rawLatitude !== "null" && rawLatitude !== "undefined" ? parseFloat(rawLatitude) : null;
  const parsedLongitude = rawLongitude != null && rawLongitude !== "null" && rawLongitude !== "undefined" ? parseFloat(rawLongitude) : null;

  const coordsFromLocation = locationString.split(",").map((value) => value.trim()).filter(Boolean);
  const fallbackLatitude = coordsFromLocation.length >= 2 ? parseFloat(coordsFromLocation[0]) : null;
  const fallbackLongitude = coordsFromLocation.length >= 2 ? parseFloat(coordsFromLocation[1]) : null;

  const latitude = !Number.isNaN(parsedLatitude) ? parsedLatitude : (!Number.isNaN(fallbackLatitude) ? fallbackLatitude : null);
  const longitude = !Number.isNaN(parsedLongitude) ? parsedLongitude : (!Number.isNaN(fallbackLongitude) ? fallbackLongitude : null);

  // Supports both applicant and employer verification file upload.
  const verification_file = req.file ? req.file.filename : null;

  console.log("Registration request received", {
    name,
    username,
    email,
    role,
    disability_type,
    skills,
    education,
    preferred_job,
    company_name,
    company_address,
    contact_number,
    company_website,
    location,
    rawLatitude,
    rawLongitude,
    latitude,
    longitude,
    verification_file
  });

  if (!username || !email || !password || !role) {
    return res.json({ success: false, message: "Missing required fields." });
  }

  if (role === "applicant") {
    if (!name || !verification_file) {
      return res.json({ success: false, message: "Missing required fields for applicant." });
    }
  }

  if (role === "employer") {
    if (!company_name || !company_address || !contact_number || !verification_file) {
      return res.json({ success: false, message: "Missing required fields for employer." });
    }
  }

  const resolvedName = name || company_name || "Employer";

  const insertUserLocation = (userId, cb) => {
    const isLatitudeValid = latitude !== null && !Number.isNaN(latitude);
    const isLongitudeValid = longitude !== null && !Number.isNaN(longitude);

    if (!isLatitudeValid || !isLongitudeValid) {
      console.log("ℹ️ No valid location data provided for user_id:", userId, "rawLatitude=", rawLatitude, "rawLongitude=", rawLongitude);
      return cb && cb(null);
    }

    const locationSQL = `INSERT INTO user_locations (user_id, latitude, longitude) VALUES (?, ?, ?)`;
    db.query(locationSQL, [userId, latitude, longitude], (locErr) => {
      if (locErr) {
        console.log("❌ User location insert error:", locErr);
      } else {
        console.log("✓ User location saved for user_id:", userId, latitude, longitude);
      }
      cb && cb(locErr);
    });
  };

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (name, username, email, password, role, is_verified)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [resolvedName, username, email, hashedPassword, role, false], (err, result) => {
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

      // Generate verification code
      const verificationCode = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Save verification code to database
      const verifySQL = `
        INSERT INTO email_verifications (user_id, email, verification_code, expires_at, verified)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(verifySQL, [user_id, email, verificationCode, expiresAt, false], async (verifyErr) => {
        if (verifyErr) {
          console.log("❌ Verification code insert error:", verifyErr);
          return res.json({
            success: false,
            message: "Failed to create verification code",
            error: verifyErr.message
          });
        }

        // Send verification email
        try {
          await sendVerificationEmail(email, verificationCode);
        } catch (emailErr) {
          console.error("❌ Email send error:", emailErr);
          // Continue even if email fails - user can still verify manually
        }

        // Create the applicant or employer profile record now so registration details are preserved.
        if (role === "applicant") {
          const applicantSQL = `
            INSERT INTO applicants (user_id, disability_type, skills, education, preferred_job, pwd_verification, pwd_verification_status, profile_picture)
            VALUES (?, ?, ?, ?, ?, ?, 'pending', NULL)
            ON DUPLICATE KEY UPDATE
              disability_type = VALUES(disability_type),
              skills = VALUES(skills),
              education = VALUES(education),
              preferred_job = VALUES(preferred_job),
              pwd_verification = VALUES(pwd_verification),
              pwd_verification_status = VALUES(pwd_verification_status)
          `;
          db.query(
            applicantSQL,
            [user_id, disability_type || null, skills || '', education || '', preferred_job || '', verification_file],
            (appErr) => {
              if (appErr) {
                console.log("❌ Applicant profile insert error:", appErr);
              }
            }
          );
        }

        if (role === "employer") {
          const employerSQL = `
            INSERT INTO employers (user_id, company_name, company_address, contact_number, company_website, verification_document, logo)
            VALUES (?, ?, ?, ?, ?, ?, NULL)
            ON DUPLICATE KEY UPDATE
              company_name = VALUES(company_name),
              company_address = VALUES(company_address),
              contact_number = VALUES(contact_number),
              company_website = VALUES(company_website),
              verification_document = VALUES(verification_document)
          `;
          db.query(
            employerSQL,
            [user_id, company_name, company_address, contact_number, company_website || null, verification_file],
            (empErr) => {
              if (empErr) {
                console.log("❌ Employer profile insert error:", empErr);
              }
            }
          );
        }

        insertUserLocation(user_id, () => {
          console.log("✓ User account created, waiting for email verification");
          res.json({
            success: true,
            message: "Account created! Please verify your email to complete registration.",
            user_id: user_id,
            email: email
          });
        });
      });

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

    // For applicants, fetch applicant_id
    if (user.role === "applicant") {
      const applicantSql = "SELECT applicant_id FROM applicants WHERE user_id = ?";
      db.query(applicantSql, [user.user_id], (appErr, appResult) => {
        if (appErr) {
          console.log("❌ Error fetching applicant_id:", appErr);
          return res.json({
            success: true,
            user_id: user.user_id,
            role: user.role,
            name: user.name,
            email: user.email,
            is_verified: user.is_verified,
            applicant_id: null,
            error: "Could not fetch applicant ID"
          });
        }

        if (!appResult || appResult.length === 0) {
          console.log("❌ No applicant record found for user_id:", user.user_id);
          return res.json({
            success: true,
            user_id: user.user_id,
            role: user.role,
            name: user.name,
            email: user.email,
            is_verified: user.is_verified,
            applicant_id: null,
            error: "No applicant record found"
          });
        }

        const applicant_id = appResult[0].applicant_id;
        console.log("✓ Login successful - user_id:", user.user_id, "applicant_id:", applicant_id);
        res.json({
          success: true,
          user_id: user.user_id,
          role: user.role,
          name: user.name,
          email: user.email,
          is_verified: user.is_verified,
          applicant_id: applicant_id
        });
      });
    } else {
      console.log("✓ Login successful (employer) - user_id:", user.user_id);
      res.json({
        success: true,
        user_id: user.user_id,
        role: user.role,
        name: user.name,
        email: user.email,
        is_verified: user.is_verified
      });
    }
  });
};
// VERIFY EMAIL
exports.verifyEmail = (req, res) => {
  const { user_id, verification_code } = req.body;

  if (!user_id || !verification_code) {
    return res.json({ success: false, message: "Missing required fields" });
  }

  const sql = `
    SELECT * FROM email_verifications 
    WHERE user_id = ? AND verification_code = ? AND (expires_at > NOW() OR verified = TRUE)
  `;

  db.query(sql, [user_id, verification_code], (err, result) => {
    if (err) {
      console.log("❌ Verification check error:", err);
      return res.json({ success: false, message: "Server error" });
    }

    if (result.length === 0) {
      return res.json({ success: false, message: "Invalid or expired verification code" });
    }

    const updateUserSQL = "UPDATE users SET is_verified = TRUE WHERE user_id = ?";
    const updateVerifySQL = "UPDATE email_verifications SET verified = TRUE, verified_at = NOW() WHERE user_id = ? AND verification_code = ?";

    db.query(updateUserSQL, [user_id], (updateErr) => {
      if (updateErr) {
        console.log("❌ Update user verification error:", updateErr);
        return res.json({ success: false, message: "Verification failed" });
      }

      db.query(updateVerifySQL, [user_id, verification_code], (verifyUpdateErr) => {
        if (verifyUpdateErr) {
          console.log("❌ Update verification record error:", verifyUpdateErr);
          // Continue anyway since user is verified
        }

        const userSQL = "SELECT * FROM users WHERE user_id = ?";
        db.query(userSQL, [user_id], (userErr, userResult) => {
          if (userErr) {
            console.log("❌ User lookup error:", userErr);
            return res.json({ success: false, message: "Verification completed but profile creation failed" });
          }

          if (userResult.length === 0) {
            return res.json({ success: false, message: "User not found" });
          }

          const user = userResult[0];
          const role = user.role;

          if (role === 'applicant') {
            const checkApplicantSQL = "SELECT applicant_id FROM applicants WHERE user_id = ?";
            db.query(checkApplicantSQL, [user_id], (checkErr, checkResult) => {
              if (checkErr) {
                console.log("❌ Applicant existence check error:", checkErr);
                return res.json({ success: false, message: "Verification completed but applicant profile creation failed" });
              }

              if (checkResult.length > 0) {
                return res.json({ success: true, message: "Email verified successfully! Applicant profile already exists." });
              }

              console.log("⚠️ No applicant profile found during verification for user_id:", user_id);
              return res.json({ success: true, message: "Email verified successfully! Please complete your applicant profile to continue." });
            });
          } else if (role === 'employer') {
            const checkEmployerSQL = "SELECT employer_id FROM employers WHERE user_id = ?";
            db.query(checkEmployerSQL, [user_id], (checkErr, checkResult) => {
              if (checkErr) {
                console.log("❌ Employer existence check error:", checkErr);
                return res.json({ success: false, message: "Verification completed but employer profile creation failed" });
              }

              if (checkResult.length > 0) {
                return res.json({ success: true, message: "Email verified successfully! Employer profile already exists." });
              }

              console.log("⚠️ No employer profile found during verification for user_id:", user_id);
              return res.json({ success: true, message: "Email verified successfully! Please complete your employer profile to continue." });
            });
          } else {
            console.log("⚠️ Unknown role for user_id:", user_id);
            res.json({ success: true, message: "Email verified successfully" });
          }
        });
      });
    });
  });
};

// RESEND VERIFICATION CODE
exports.resendVerificationCode = async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.json({ success: false, message: "Missing user_id" });
  }

  // Get user email
  const userSQL = "SELECT email FROM users WHERE user_id = ?";
  db.query(userSQL, [user_id], async (err, result) => {
    if (err) {
      console.log("❌ User lookup error:", err);
      return res.json({ success: false, message: "Server error" });
    }

    if (result.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }

    const email = result[0].email;

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Delete old verification code and create new one
    const deleteSQL = "DELETE FROM email_verifications WHERE user_id = ?";
    db.query(deleteSQL, [user_id], async (deleteErr) => {
      if (deleteErr) {
        console.log("⚠️ Delete old verification error:", deleteErr);
      }

      // Insert new verification code
      const insertSQL = `
        INSERT INTO email_verifications (user_id, email, verification_code, expires_at)
        VALUES (?, ?, ?, ?)
      `;
      db.query(insertSQL, [user_id, email, verificationCode, expiresAt], async (insertErr) => {
        if (insertErr) {
          console.log("❌ Insert verification error:", insertErr);
          return res.json({ success: false, message: "Failed to generate new code" });
        }

        // Send email
        try {
          await sendVerificationEmail(email, verificationCode);
          console.log("✓ Verification code resent to:", email);
          res.json({ success: true, message: "✓ Verification code sent! Check your email or console logs." });
        } catch (emailErr) {
          console.error("❌ Email send error:", emailErr);
          res.json({ success: true, message: "✓ Code generated! Check console for verification code." });
        }
      });
    });
  });
};

// FORGOT PASSWORD - Request Password Reset
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }

  // Find user by email
  const userSQL = "SELECT * FROM users WHERE email = ?";
  db.query(userSQL, [email], async (err, result) => {
    if (err) {
      console.log("❌ User lookup error:", err);
      return res.json({ success: false, message: "Server error" });
    }

    if (result.length === 0) {
      // Don't reveal if email exists (security best practice)
      return res.json({ success: true, message: "If an account exists with this email, you will receive a password reset code." });
    }

    const user = result[0];
    const user_id = user.user_id;

    // Check for an existing valid reset code first.
    const existingSQL = `
      SELECT * FROM password_resets
      WHERE user_id = ? AND expires_at > UTC_TIMESTAMP() AND used = FALSE
      LIMIT 1
    `;

    db.query(existingSQL, [user_id], async (existingErr, existingResult) => {
      if (existingErr) {
        console.log("❌ Password reset lookup error:", existingErr);
        return res.json({ success: false, message: "Server error" });
      }

      let resetCode = generateVerificationCode();
      let expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      let query;
      let params;

      if (existingResult.length > 0) {
        // Reuse valid existing code and extend expiry.
        resetCode = existingResult[0].reset_code;
        expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        query = `
          UPDATE password_resets
          SET expires_at = ?, created_at = UTC_TIMESTAMP(), used = FALSE
          WHERE user_id = ?
        `;
        params = [expiresAt, user_id];
      } else {
        // Insert a new reset code.
        query = `
          INSERT INTO password_resets (user_id, reset_code, expires_at, used)
          VALUES (?, ?, ?, ?)
        `;
        params = [user_id, resetCode, expiresAt, false];
      }

      db.query(query, params, async (resetErr) => {
        if (resetErr) {
          console.log("❌ Password reset save error:", resetErr);
          return res.json({ success: false, message: "Failed to generate reset code" });
        }

        // Send password reset email
        try {
          await sendPasswordResetEmail(user.email, resetCode);
        } catch (emailErr) {
          console.error("❌ Password reset email error:", emailErr);
          // Continue anyway
        }

        console.log("✓ Password reset code sent for user_id:", user_id, "Code:", resetCode);
        res.json({ 
          success: true,
          message: "If an account exists with this email, you will receive a password reset code.",
          user_id: user_id,
          email: user.email
        });
      });
    });
  });
};

// VERIFY PASSWORD RESET CODE
exports.verifyResetCode = (req, res) => {
  const { user_id, reset_code } = req.body;

  if (!user_id || !reset_code) {
    return res.json({ success: false, message: "Missing required fields" });
  }

  const sql = `
    SELECT * FROM password_resets 
    WHERE user_id = ? AND reset_code = ? AND expires_at > UTC_TIMESTAMP() AND used = FALSE
  `;

  db.query(sql, [user_id, reset_code], (err, result) => {
    if (err) {
      console.log("❌ Reset code verification error:", err);
      return res.json({ success: false, message: "Server error" });
    }

    if (result.length === 0) {
      return res.json({ success: false, message: "Invalid or expired reset code" });
    }

    console.log("✓ Reset code verified for user_id:", user_id);
    res.json({ success: true, message: "Reset code verified successfully" });
  });
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  const { user_id, reset_code, new_password } = req.body;

  if (!user_id || !reset_code || !new_password) {
    return res.json({ success: false, message: "Missing required fields" });
  }

  if (new_password.length < 6) {
    return res.json({ success: false, message: "Password must be at least 6 characters" });
  }

  // Verify the reset code is valid
  const verifySQL = `
    SELECT * FROM password_resets 
    WHERE user_id = ? AND reset_code = ? AND expires_at > UTC_TIMESTAMP() AND used = FALSE
  `;

  db.query(verifySQL, [user_id, reset_code], async (verifyErr, verifyResult) => {
    if (verifyErr) {
      console.log("❌ Reset code verification error:", verifyErr);
      return res.json({ success: false, message: "Server error" });
    }

    if (verifyResult.length === 0) {
      return res.json({ success: false, message: "Invalid or expired reset code" });
    }

    try {
      // Hash new password
      const hashedPassword = await bcrypt.hash(new_password, 10);

      // Update user password
      const updateSQL = "UPDATE users SET password = ? WHERE user_id = ?";
      db.query(updateSQL, [hashedPassword, user_id], (updateErr) => {
        if (updateErr) {
          console.log("❌ Password update error:", updateErr);
          return res.json({ success: false, message: "Failed to update password" });
        }

        // Mark reset code as used
        const markUsedSQL = "UPDATE password_resets SET used = TRUE, used_at = UTC_TIMESTAMP() WHERE user_id = ?";
        db.query(markUsedSQL, [user_id], (markErr) => {
          if (markErr) {
            console.log("⚠️ Failed to mark reset code as used (non-critical):", markErr);
          }

          console.log("✓ Password reset successful for user_id:", user_id);
          res.json({ success: true, message: "Password reset successfully! Please login with your new password." });
        });
      });
    } catch (error) {
      console.log("❌ Password hash error:", error);
      return res.json({ success: false, message: "Server error" });
    }
  });
};