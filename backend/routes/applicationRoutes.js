const express = require("express");
const router = express.Router();
const { 
  getApplications, 
  applyJob,
  withdrawApplication,
  updateApplicationStatus,
  scheduleInterview,
  sendJobOffer
} = require("../controllers/applicationController");

router.get("/:user_id", getApplications);
router.post("/apply", applyJob);
router.delete("/:applicationId/withdraw", withdrawApplication);
router.put("/:applicationId/status", updateApplicationStatus);
router.post("/:applicationId/interview", scheduleInterview);
router.post("/:applicationId/offer", sendJobOffer);

module.exports = router;