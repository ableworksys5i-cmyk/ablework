const express = require("express");
const router = express.Router();
const geofenceController = require("../controllers/geofenceController");

router.get("/", geofenceController.listGeofences);
router.post("/", geofenceController.createGeofence);

module.exports = router;
