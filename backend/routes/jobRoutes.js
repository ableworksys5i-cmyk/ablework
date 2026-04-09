const express = require("express");
const router = express.Router();
const { getRecommendedJobs, getNearbyJobs, getJobsByCategory, getSmartMatchedJobs } = require("../controllers/jobController");

router.get("/recommended/:user_id", getRecommendedJobs);
router.get("/nearby", getNearbyJobs);
router.get("/category", getJobsByCategory);
router.get("/smart-matched", getSmartMatchedJobs);

module.exports = router;