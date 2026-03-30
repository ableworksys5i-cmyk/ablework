import React from 'react';
import './NearbyJobs.css';

function NearbyJobs({ jobs, userLocation, onApply, onSaveJob, savedJobs }) {
  // jobs prop now contains the already filtered nearby jobs from the backend
  const nearbyJobs = jobs;

  const isJobSaved = (jobId) => savedJobs.some(saved => saved.job_id === jobId);

  return (
    <div className="nearby-jobs">
      <h2>📍 Nearby Jobs</h2>

      {/* Location Info */}
      <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#f9f9f9", marginBottom: "30px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
          <span style={{ fontSize: "1.5rem" }}>📍</span>
          <div>
            <h3 style={{ margin: "0 0 5px 0" }}>Jobs near {userLocation}</h3>
            <p style={{ margin: 0, color: "#666" }}>
              Found {nearbyJobs.length} job{nearbyJobs.length !== 1 ? 's' : ''} in your area
            </p>
          </div>
        </div>
        <p style={{ margin: "10px 0 0 0", fontSize: "14px", color: "#666" }}>
          💡 Tip: Enable location services for more accurate nearby job recommendations
        </p>
      </div>

      {/* Job Listings */}
      <div style={{ display: "grid", gap: "20px" }}>
        {nearbyJobs.map((job, index) => (
          <div key={index} style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#f9f9f9" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 5px 0", fontSize: "1.5rem" }}>{job.job_title}</h3>
                <p style={{ margin: "0 0 10px 0", color: "#666", fontSize: "1.1rem" }}>{job.company || "Company"}</p>
                <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginBottom: "10px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "14px" }}>
                    📍 {job.location}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "14px" }}>
                    💰 {job.salary || "N/A"}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "14px" }}>
                    🕒 {job.job_type || "Full-time"}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "14px", color: "#28a745" }}>
                    📏 {calculateDistance(userLocation, job.location)} miles away
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => onSaveJob(job.job_id)}
                  disabled={isJobSaved(job.job_id)}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: isJobSaved(job.job_id) ? "#6c757d" : "#ffc107",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: isJobSaved(job.job_id) ? "not-allowed" : "pointer",
                    fontSize: "14px"
                  }}
                >
                  {isJobSaved(job.job_id) ? "💾 Saved" : "💾 Save"}
                </button>
                <button
                  onClick={() => onApply(job.job_id)}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  📤 Apply Now
                </button>
              </div>
            </div>

            <p style={{ margin: "0 0 15px 0", color: "#555", lineHeight: "1.5" }}>
              {job.job_description && job.job_description.length > 200 ? `${job.job_description.substring(0, 200)}...` : job.job_description || "No description available"}
            </p>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {job.job_category ? (
                  <span
                    style={{
                      backgroundColor: "#e9ecef",
                      padding: "3px 8px",
                      borderRadius: "12px",
                      fontSize: "12px"
                    }}
                  >
                    {job.job_category}
                  </span>
                ) : null}
                {job.skills && job.skills.length > 0 ? job.skills.slice(0, 2).map((skill, skillIndex) => (
                  <span
                    key={skillIndex}
                    style={{
                      backgroundColor: "#e9ecef",
                      padding: "3px 8px",
                      borderRadius: "12px",
                      fontSize: "12px"
                    }}
                  >
                    {skill}
                  </span>
                )) : null}
                {(!job.skills || job.skills.length === 0) && !job.job_category && (
                  <span style={{ fontSize: "12px", color: "#666" }}>
                    No category specified
                  </span>
                )}
              </div>
              <span style={{ fontSize: "14px", color: "#666" }}>
                Posted {job.created_at ? new Date(job.created_at).toLocaleDateString() : "Recently"}
              </span>
            </div>
          </div>
        ))}

        {nearbyJobs.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px", border: "2px dashed #ddd", borderRadius: "12px", backgroundColor: "#f9f9f9" }}>
            <h3 style={{ margin: "0 0 10px 0", color: "#666" }}>No nearby jobs found</h3>
            <p style={{ margin: "0 0 20px 0", color: "#666" }}>
              We couldn't find any jobs in your immediate area. Try expanding your search or updating your location.
            </p>
            <button
              style={{ padding: "12px 24px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px" }}
            >
              🔍 Search All Locations
            </button>
          </div>
        )}
      </div>

      {/* Map Placeholder */}
      {nearbyJobs.length > 0 && (
        <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#f9f9f9", marginTop: "30px" }}>
          <h3 style={{ margin: "0 0 20px 0" }}>🗺️ Job Locations Map</h3>
          <div style={{
            height: "300px",
            backgroundColor: "#e9ecef",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px dashed #ccc"
          }}>
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: "3rem", marginBottom: "10px", display: "block" }}>🗺️</span>
              <p style={{ margin: 0, color: "#666" }}>Interactive map would be displayed here</p>
              <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "#666" }}>
                Showing {nearbyJobs.length} job location{nearbyJobs.length !== 1 ? 's' : ''} near {userLocation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Mock distance calculation - in real app this would use geolocation APIs
function calculateDistance(userLocation, jobLocation) {
  // Simple mock distance calculation
  const distances = {
    'New York': 5,
    'Brooklyn': 8,
    'Queens': 12,
    'Bronx': 15,
    'Staten Island': 20,
    'San Francisco': 3,
    'Oakland': 10,
    'Berkeley': 12,
    'Los Angeles': 8,
    'Chicago': 6,
    'Houston': 15,
    'Phoenix': 20,
    'Philadelphia': 4,
    'San Antonio': 18,
    'San Diego': 25,
    'Dallas': 12,
    'San Jose': 7,
    'Austin': 16,
    'Jacksonville': 22,
    'Fort Worth': 14
  };

  // Extract city from location string
  const userCity = userLocation.toLowerCase().split(',')[0].trim();
  const jobCity = jobLocation.toLowerCase().split(',')[0].trim();

  if (userCity === jobCity) return Math.floor(Math.random() * 5) + 1; // 1-5 miles if same city

  // Return mock distance based on city
  return distances[jobCity] || Math.floor(Math.random() * 30) + 5; // 5-35 miles default
}

export default NearbyJobs;