const db = require("../db/db");

exports.listGeofences = (req, res) => {
  const employer_id = req.query.employer_id;
  let sql = "SELECT * FROM geofences";
  const params = [];

  if (employer_id) {
    sql += " WHERE employer_id = ?";
    params.push(employer_id);
  }

  sql += " ORDER BY created_at DESC";
  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error", details: err.message });
    res.json(result);
  });
};

exports.createGeofence = (req, res) => {
  const { employer_id, names, latitude, longitude, radius } = req.body;

  if (!employer_id || !names || latitude === undefined || longitude === undefined || radius === undefined) {
    return res.status(400).json({ error: "Missing required geofence fields" });
  }

  const sql = "INSERT INTO geofences (employer_id, name, latitude, longitude, radius) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [employer_id, names, latitude, longitude, radius], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error", details: err.message });
    res.json({ message: "Geofence created", geofence_id: result.insertId });
  });
};

exports.deleteGeofence = (req, res) => {
  const { geofence_id } = req.params;
  const employer_id = req.query.employer_id;

  if (!geofence_id || !employer_id) {
    return res.status(400).json({ error: "geofence_id and employer_id are required" });
  }

  const sql = "DELETE FROM geofences WHERE geofence_id = ? AND employer_id = ?";
  db.query(sql, [geofence_id, employer_id], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error", details: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Geofence not found or not owned by this employer" });
    }
    res.json({ message: "Geofence deleted" });
  });
};
