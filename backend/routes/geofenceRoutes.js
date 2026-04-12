const express = require("express");
const router = express.Router();
const geofenceController = require("../controllers/geofenceController");

router.get("/", geofenceController.listGeofences);
router.post("/", geofenceController.createGeofence);
router.delete("/:geofence_id", geofenceController.deleteGeofence);

module.exports = router;
