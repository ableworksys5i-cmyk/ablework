const db = require("../db/db");

exports.getRecommendedJobs = (req, res) => {
  const sql = `SELECT * FROM jobs ORDER BY created_at DESC LIMIT 5`;

  db.query(sql, (err, result) => {
    if (err) return res.json(err);
    res.json(result);
  });
};

exports.getNearbyJobs = (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: "lat and lng query params are required" });
  }

  const sql = `
    SELECT *, 
    (6371 * ACOS(
      COS(RADIANS(?)) * COS(RADIANS(latitude)) * COS(RADIANS(longitude) - RADIANS(?)) +
      SIN(RADIANS(?)) * SIN(RADIANS(latitude))
    )) AS distance_km
    FROM jobs
    HAVING distance_km <= 25
    ORDER BY distance_km ASC
  `;

  db.query(sql, [lat, lng, lat], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error", details: err.message });
    res.json(result);
  });
};

exports.getJobsByCategory = (req, res) => {
  const category = req.query.category || "";

  const sql = category
    ? `SELECT * FROM jobs WHERE LOWER(job_category) = LOWER(?) ORDER BY created_at DESC`
    : `SELECT * FROM jobs ORDER BY created_at DESC`;

  const params = category ? [category] : [];

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error", details: err.message });
    res.json(result);
  });
};