const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { 
  getApplications, 
  applyJob,
  withdrawApplication,
  updateApplicationStatus,
  scheduleInterview,
  sendJobOffer
} = require("../controllers/applicationController");

// Resume upload setup for applications
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/resumes"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const resumeUpload = multer({
  storage: resumeStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, and DOCX files are allowed"));
    }
  }
});

router.get("/:user_id", getApplications);
router.post("/apply", applyJob);
router.post("/upload-resume", resumeUpload.single("resume"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  res.json({ filename: req.file.filename });
});
router.delete("/:applicationId/withdraw", withdrawApplication);
router.put("/:applicationId/status", updateApplicationStatus);
router.post("/:applicationId/interview", scheduleInterview);
router.post("/:applicationId/offer", sendJobOffer);

module.exports = router;