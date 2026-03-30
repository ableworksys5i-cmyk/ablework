const express = require("express");
const router = express.Router();
const { getRecommendedJobs, getNearbyJobs, getJobsByCategory } = require("../controllers/jobController");

router.get("/recommended/:user_id", getRecommendedJobs);
router.get("/nearby", getNearbyJobs);
router.get("/category", getJobsByCategory);

module.exports = router;