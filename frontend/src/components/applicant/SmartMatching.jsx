import React from 'react';
import './SmartMatching.css';
import { formatJobLocationText } from '../../utils/locationUtils';

function SmartMatching({ jobs, userLocation, onApply, onSaveJob, onViewJob, savedJobs, applicantSkills }) {
  const matchedJobs = jobs;

  const isJobSaved = (jobId) => savedJobs.some(saved => saved.job_id === jobId || saved.id === jobId);

  const getMatchQualityLabel = (matchPercentage) => {
    if (matchPercentage >= 80) return "Excellent Match";
    if (matchPercentage >= 60) return "Good Match";
    if (matchPercentage >= 40) return "Decent Match";
    return "Fair Match";
  };

  const getMatchQualityColor = (matchPercentage) => {
    if (matchPercentage >= 80) return "#27ae60"; // Green
    if (matchPercentage >= 60) return "#2980b9"; // Blue
    if (matchPercentage >= 40) return "#f39c12"; // Orange
    return "#e74c3c"; // Red
  };

  return (
    <div className="smart-matching">
      <h2>🎯 Job Recommendations</h2>

      {/* Info Section */}
      <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#f9f9f9", marginBottom: "30px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
          <span style={{ fontSize: "1.5rem" }}>🎯</span>
          <div>
            <h3 style={{ margin: "0 0 5px 0" }}>Jobs Matching Your Skills & Location</h3>
            <p style={{ margin: 0, color: "#666" }}>
              Found {matchedJobs.length} job{matchedJobs.length !== 1 ? 's' : ''} that align with your skills and location
            </p>
          </div>
        </div>
        <p style={{ margin: "10px 0 0 0", fontSize: "14px", color: "#666" }}>
          💡 Tip: Update your skills in your profile to see more matching opportunities
        </p>
      </div>

      {/* Job Listings */}
      {matchedJobs.length === 0 ? (
        <div style={{ border: "2px solid #ddd", borderRadius: "12px", padding: "40px 20px", backgroundColor: "#f9f9f9", textAlign: "center" }}>
          <p style={{ color: "#666", fontSize: "1.1rem" }}>No jobs match your skills and location yet.</p>
          <p style={{ color: "#999", fontSize: "0.95rem" }}>Update your profile to get more personalized recommendations</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {matchedJobs.map((job, index) => (
            <div key={index} style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#f9f9f9" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 5px 0", fontSize: "1.5rem" }}>{job.job_title}</h3>
                  <p style={{ margin: "0 0 10px 0", color: "#666", fontSize: "1.1rem" }}>{job.company || "Company"}</p>
                  
                  {/* Match Quality Badge */}
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px", flexWrap: "wrap" }}>
                    <span style={{
                      backgroundColor: getMatchQualityColor(job.skill_match_percentage),
                      color: "white",
                      padding: "5px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "bold"
                    }}>
                      {getMatchQualityLabel(job.skill_match_percentage)} ({Math.round(job.skill_match_percentage)}%)
                    </span>
                    {job.distance_km <= 3 && (
                      <span style={{
                        backgroundColor: "#27ae60",
                        color: "white",
                        padding: "5px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "bold"
                      }}>
                        📍 Very Close
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginBottom: "10px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "14px" }}>
                      📍 {formatJobLocationText(job.location)}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "14px" }}>
                      💰 {job.salary || "N/A"}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "14px" }}>
                      🕒 {job.job_type || "Full-time"}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "14px", color: "#28a745" }}>
                      📏 {job.distance_km.toFixed(1)} km away
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
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
                      fontSize: "14px",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {isJobSaved(job.job_id) ? "💾 Saved" : "💾 Save"}
                  </button>
                  <button
                    onClick={() => onViewJob ? onViewJob(job) : null}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "#17a2b8",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px",
                      whiteSpace: "nowrap"
                    }}
                  >
                    👁️ View Job
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
                      fontSize: "14px",
                      whiteSpace: "nowrap"
                    }}
                  >
                    📤 Apply Now
                  </button>
                </div>
              </div>

              <p style={{ margin: "0 0 15px 0", color: "#555", lineHeight: "1.5" }}>
                {job.job_description && job.job_description.length > 200 ? `${job.job_description.substring(0, 200)}...` : job.job_description || "No description available"}
              </p>

              {/* Skills Match Section */}
              {job.required_skills && (
                <div style={{ marginBottom: "15px", paddingTop: "15px", borderTop: "1px solid #ddd" }}>
                  <p style={{ margin: "0 0 8px 0", fontSize: "13px", fontWeight: "bold", color: "#333" }}>📌 Required Skills:</p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {job.required_skills.split(",").map((skill, idx) => {
                      const skillTrim = skill.trim().toLowerCase();
                      const isMatched = applicantSkills && applicantSkills.some(appSkill =>
                        appSkill.includes(skillTrim) || skillTrim.includes(appSkill)
                      );
                      return (
                        <span
                          key={idx}
                          style={{
                            backgroundColor: isMatched ? "#27ae60" : "#e9ecef",
                            color: isMatched ? "white" : "#333",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: isMatched ? "bold" : "normal"
                          }}
                        >
                          {isMatched ? "✓ " : ""}{skill.trim()}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {job.job_category && (
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
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SmartMatching;
