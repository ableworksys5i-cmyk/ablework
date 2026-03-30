import React from 'react';

function SmartMatching({ applicants, onViewApplicant }) {
  return (
    <div>
      <h2 style={{ fontSize: "2rem", marginBottom: "20px" }}>🧠 Smart Applicant Matching</h2>

      <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", marginBottom: "20px", backgroundColor: "#e3f2fd" }}>
        <h3>AI-Powered Recommendations</h3>
        <p>Automatically matched candidates based on job requirements, skills, and location proximity.</p>
      </div>

      <div style={{ display: "grid", gap: "15px" }}>
        {applicants
          .sort((a, b) => b.match_score - a.match_score)
          .slice(0, 10)
          .map(applicant => (
          <div key={applicant.application_id} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "15px", backgroundColor: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: "0 0 5px 0" }}>{applicant.applicant_name}</h4>
                <p style={{ margin: "5px 0", color: "#666" }}>{applicant.job_title}</p>
                <p style={{ margin: "5px 0", fontSize: "14px" }}>{applicant.skills}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "24px", fontWeight: "bold", color: "#28a745", marginBottom: "5px" }}>
                  {applicant.match_score}%
                </div>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  {applicant.distance}km away
                </div>
                <button
                  onClick={() => onViewApplicant(applicant)}
                  style={{ marginTop: "10px", padding: "6px 12px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                >
                  View Profile
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SmartMatching;