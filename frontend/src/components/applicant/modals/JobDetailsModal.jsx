import React from 'react';

function JobDetailsModal({ isOpen, onClose, job, onApply, onSaveJob, savedJobs }) {
  if (!isOpen || !job) return null;

  const isJobSaved = savedJobs.some(saved => saved.id === job.id);

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "12px",
        width: "90%",
        maxWidth: "800px",
        maxHeight: "80vh",
        overflowY: "auto"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0 }}>💼 Job Details</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#666"
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: "grid", gap: "20px" }}>
          {/* Job Header */}
          <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px", backgroundColor: "#f8f9fa" }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "1.8rem" }}>{job.title}</h3>
            <p style={{ margin: "0 0 15px 0", color: "#666", fontSize: "1.2rem" }}>{job.company}</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px", marginBottom: "15px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>📍</span>
                <span>{job.location}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>💰</span>
                <span>{job.salary}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>🕒</span>
                <span>{job.type}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>📅</span>
                <span>Posted {new Date(job.postedDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => onApply(job.id)}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold"
                }}
              >
                📤 Apply Now
              </button>
              <button
                onClick={() => onSaveJob(job.id)}
                disabled={isJobSaved}
                style={{
                  padding: "12px 24px",
                  backgroundColor: isJobSaved ? "#6c757d" : "#ffc107",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: isJobSaved ? "not-allowed" : "pointer",
                  fontSize: "16px"
                }}
              >
                {isJobSaved ? "💾 Saved" : "💾 Save Job"}
              </button>
            </div>
          </div>

          {/* Job Description */}
          <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px" }}>
            <h4 style={{ margin: "0 0 15px 0" }}>📋 Job Description</h4>
            <p style={{ margin: 0, lineHeight: "1.6", whiteSpace: "pre-line" }}>{job.description}</p>
          </div>

          {/* Requirements */}
          <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px" }}>
            <h4 style={{ margin: "0 0 15px 0" }}>✅ Requirements</h4>
            <p style={{ margin: 0, lineHeight: "1.6", whiteSpace: "pre-line" }}>{job.requirements}</p>
          </div>

          {/* Skills */}
          <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px" }}>
            <h4 style={{ margin: "0 0 15px 0" }}>🛠️ Required Skills</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {job.skills.map((skill, index) => (
                <span
                  key={index}
                  style={{
                    backgroundColor: "#e9ecef",
                    padding: "8px 16px",
                    borderRadius: "20px",
                    fontSize: "14px",
                    fontWeight: "500"
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Company Info */}
          <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px" }}>
            <h4 style={{ margin: "0 0 15px 0" }}>🏢 About {job.company}</h4>
            <p style={{ margin: 0, lineHeight: "1.6" }}>
              {job.companyDescription || "Information about the company will be displayed here."}
            </p>
          </div>

          {/* Application Tips */}
          <div style={{ border: "1px solid #28a745", borderRadius: "8px", padding: "20px", backgroundColor: "#e8f5e8" }}>
            <h4 style={{ margin: "0 0 15px 0", color: "#28a745" }}>💡 Application Tips</h4>
            <ul style={{ margin: 0, paddingLeft: "20px", lineHeight: "1.6" }}>
              <li>Customize your resume and cover letter for this specific role</li>
              <li>Highlight relevant experience and skills that match the job requirements</li>
              <li>Research the company and mention why you're interested in working there</li>
              <li>Proofread your application before submitting</li>
              <li>Follow up if you haven't heard back within a week</li>
            </ul>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "30px" }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Close
          </button>
          <button
            onClick={() => onApply(job.id)}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            📤 Apply for this Job
          </button>
        </div>
      </div>
    </div>
  );
}

export default JobDetailsModal;