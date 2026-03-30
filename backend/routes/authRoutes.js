const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const authController = require("../controllers/authController");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/pwd_verification"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["application/pdf", "image/jpeg", "image/png", "image/gif"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  }
});

// Register
router.post("/register", upload.single("pwd_verification_file"), authController.register);

// Login
router.post("/login", authController.login);

module.exports = router;