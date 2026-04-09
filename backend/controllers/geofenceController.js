const db = require("../db/db");

exports.listGeofences = (req, res) => {
  const sql = "SELECT * FROM geofences ORDER BY created_at DESC";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error", details: err.message });
    res.json(result);
  });
};

exports.createGeofence = (req, res) => {
  const { name, latitude, longitude, radius } = req.body;

  if (!name || latitude === undefined || longitude === undefined || radius === undefined) {
    return res.status(400).json({ error: "Missing required geofence fields" });
  }

  const sql = "INSERT INTO geofences (name, latitude, longitude, radius) VALUES (?, ?, ?, ?)";
  db.query(sql, [name, latitude, longitude, radius], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error", details: err.message });
    res.json({ message: "Geofence created", geofence_id: result.insertId });
  });
};
