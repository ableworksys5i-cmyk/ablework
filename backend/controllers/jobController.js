const db = require("../db/db");

exports.getRecommendedJobs = (req, res) => {
  const sql = `
    SELECT j.*, e.company_name AS company, e.logo AS company_logo, e.company_address, e.company_website, e.contact_number, u.email AS company_email
    FROM jobs j
    LEFT JOIN employers e ON j.employer_id = e.employer_id
    LEFT JOIN users u ON e.user_id = u.user_id
    WHERE j.status = 'active'
    ORDER BY j.created_at DESC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.json(err);
    res.json(result);
  });
};

exports.getNearbyJobs = (req, res) => {
  const { user_id, lat, lng } = req.query;

  const getUserLocation = (callback) => {
    const hasCoords = typeof lat !== "undefined" && typeof lng !== "undefined";
    if (hasCoords && lat !== "" && lng !== "") {
      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);
      if (isNaN(parsedLat) || isNaN(parsedLng)) {
        return callback(new Error("Invalid latitude/longitude values"));
      }
      return callback(null, { latitude: parsedLat, longitude: parsedLng });
    }

    if (user_id) {
      // Use latest recorded location for this user
      db.query(
        "SELECT latitude, longitude FROM user_locations WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 1",
        [user_id],
        (locErr, locRows) => {
          if (locErr) return callback(locErr);
          if (!locRows || locRows.length === 0) {
            return callback(new Error("User location not found"));
          }
          callback(null, { latitude: locRows[0].latitude, longitude: locRows[0].longitude });
        }
      );
    } else {
      callback(new Error("user_id or lat/lng query params are required"));
    }
  };

  const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  getUserLocation((locErr, userLocation) => {
    if (locErr) {
      return res.status(400).json({ error: locErr.message });
    }

    const userLat = parseFloat(userLocation.latitude);
    const userLng = parseFloat(userLocation.longitude);

    db.query(
      `
      SELECT j.*, e.company_name AS company, e.logo AS company_logo, e.company_address, e.company_website, e.contact_number, u.email AS company_email
      FROM jobs j
      LEFT JOIN employers e ON j.employer_id = e.employer_id
      LEFT JOIN users u ON e.user_id = u.user_id
      WHERE j.status = 'active'
      `,
      (jobErr, jobs) => {
        if (jobErr) {
          return res.status(500).json({ error: "Database error", details: jobErr.message });
        }

      db.query("SELECT * FROM geofences", (gfErr, geofences) => {
        if (gfErr) {
          return res.status(500).json({ error: "Database error", details: gfErr.message });
        }

        const activeGeofences = geofences.filter((gf) => {
          const distToFence = calculateDistanceKm(userLat, userLng, parseFloat(gf.latitude), parseFloat(gf.longitude));
          const fenceRadiusKm = parseFloat(gf.radius) / 1000; // if radius is meters; adjust as needed
          return distToFence <= fenceRadiusKm;
        });

        const nearbyJobs = jobs
          .map((job) => {
            const jobLat = parseFloat(job.latitude);
            const jobLng = parseFloat(job.longitude);
            
            // Skip jobs with invalid coordinates
            if (isNaN(jobLat) || isNaN(jobLng)) {
              return null;
            }
            
            const distance = calculateDistanceKm(userLat, userLng, jobLat, jobLng);
            const inGeofence = activeGeofences.some((gf) => {
              const distJobToFence = calculateDistanceKm(jobLat, jobLng, parseFloat(gf.latitude), parseFloat(gf.longitude));
              const fenceRadiusKm = parseFloat(gf.radius) / 1000;
              return distJobToFence <= fenceRadiusKm;
            });
            return { ...job, distance_km: distance, in_geofence: inGeofence };
          })
          .filter((job) => job !== null && job.distance_km <= 10)
          .sort((a, b) => a.distance_km - b.distance_km);

        res.json(nearbyJobs);
      });
    });
  });
};

exports.getSmartMatchedJobs = (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }

  // Get applicant skills and location
  db.query(
    "SELECT a.skills FROM applicants a JOIN users u ON a.user_id = u.user_id WHERE a.user_id = ?",
    [user_id],
    (applicantErr, applicantRows) => {
      if (applicantErr) {
        return res.status(500).json({ error: "Database error", details: applicantErr.message });
      }

      if (!applicantRows || applicantRows.length === 0) {
        return res.status(404).json({ error: "Applicant not found" });
      }

      const applicantSkills = applicantRows[0].skills ? applicantRows[0].skills.split(",").map(s => s.trim().toLowerCase()) : [];

      // Get applicant location
      db.query(
        "SELECT latitude, longitude FROM user_locations WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 1",
        [user_id],
        (locErr, locRows) => {
          if (locErr) {
            return res.status(500).json({ error: "Database error", details: locErr.message });
          }

          if (!locRows || locRows.length === 0) {
            // If no location found, return empty
            return res.json([]);
          }

          const userLat = parseFloat(locRows[0].latitude);
          const userLng = parseFloat(locRows[0].longitude);

          // Get all active jobs
db.query(
              `
              SELECT j.*, e.company_name AS company, e.logo AS company_logo, e.company_address, e.company_website, e.contact_number, u.email AS company_email
              FROM jobs j
              LEFT JOIN employers e ON j.employer_id = e.employer_id
              LEFT JOIN users u ON e.user_id = u.user_id
              WHERE j.status = 'active'
              `,
              (jobErr, jobs) => {
                if (jobErr) {
                  return res.status(500).json({ error: "Database error", details: jobErr.message });
                }

            const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
              const toRad = (value) => (value * Math.PI) / 180;
              const R = 6371; // Earth radius in km
              const dLat = toRad(lat2 - lat1);
              const dLon = toRad(lon2 - lon1);
              const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              return R * c;
            };

            const calculateSkillMatch = (jobSkillsStr, applicantSkills) => {
              if (!jobSkillsStr) return 0;
              const jobSkills = jobSkillsStr.split(",").map(s => s.trim().toLowerCase());
              const matches = jobSkills.filter(skill => 
                applicantSkills.some(appSkill => 
                  appSkill.includes(skill) || skill.includes(appSkill)
                )
              ).length;
              return matches > 0 ? (matches / jobSkills.length) * 100 : 0;
            };

            const matchedJobs = jobs
              .map((job) => {
                const jobLat = parseFloat(job.latitude);
                const jobLng = parseFloat(job.longitude);
                const distance = calculateDistanceKm(userLat, userLng, jobLat, jobLng);
                const skillMatchPercentage = calculateSkillMatch(job.required_skills, applicantSkills);
                
                // Location match: within 5km AND skill match > 30% (accessibility for PWD users)
                const isLocationMatch = distance <= 5;
                const isSkillMatch = skillMatchPercentage >= 30;

                return {
                  ...job,
                  distance_km: distance,
                  skill_match_percentage: skillMatchPercentage,
                  match_score: (skillMatchPercentage + (isLocationMatch ? 50 : 0)) // Combined score
                };
              })
              .filter((job) => job.skill_match_percentage >= 30 && job.distance_km <= 10)
              .sort((a, b) => b.match_score - a.match_score);

            res.json(matchedJobs);
          });
        }
      );
    }
  );
};

exports.getJobsByCategory = (req, res) => {
  const category = req.query.category || "";

  const sql = category
    ? `
      SELECT j.*, e.company_name AS company, e.logo AS company_logo, e.company_address, e.company_website, e.contact_number, u.email AS company_email
      FROM jobs j
      LEFT JOIN employers e ON j.employer_id = e.employer_id
      LEFT JOIN users u ON e.user_id = u.user_id
      WHERE LOWER(j.job_category) = LOWER(?)
      ORDER BY j.created_at DESC`
    : `
      SELECT j.*, e.company_name AS company, e.logo AS company_logo, e.company_address, e.company_website, e.contact_number, u.email AS company_email
      FROM jobs j
      LEFT JOIN employers e ON j.employer_id = e.employer_id
      LEFT JOIN users u ON e.user_id = u.user_id
      ORDER BY j.created_at DESC`;
  const params = category ? [category] : [];

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error", details: err.message });
    res.json(result);
  });
};