import React from 'react';

function ApplicantModal({ isOpen, onClose, applicant, onStatusChange }) {
  if (!isOpen || !applicant) return null;

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
        maxWidth: "700px",
        maxHeight: "80vh",
        overflowY: "auto"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0 }}>👤 Applicant Details</h2>
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
          {/* Header Info */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px", padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#007bff", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "32px", fontWeight: "bold" }}>
              {applicant.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 style={{ margin: "0 0 5px 0", fontSize: "24px" }}>{applicant.name}</h3>
              <p style={{ margin: "0 0 5px 0", color: "#666" }}>{applicant.email}</p>
              <p style={{ margin: 0, color: "#666" }}>{applicant.phone}</p>
            </div>
          </div>

          {/* Application Details */}
          <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px" }}>
            <h4 style={{ margin: "0 0 15px 0" }}>📋 Application Details</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div>
                <strong>Applied Position:</strong>
                <p style={{ margin: "5px 0 0 0" }}>{applicant.position}</p>
              </div>
              <div>
                <strong>Applied Date:</strong>
                <p style={{ margin: "5px 0 0 0" }}>{new Date(applicant.appliedDate).toLocaleDateString()}</p>
              </div>
              <div>
                <strong>Experience:</strong>
                <p style={{ margin: "5px 0 0 0" }}>{applicant.experience} years</p>
              </div>
              <div>
                <strong>Location:</strong>
                <p style={{ margin: "5px 0 0 0" }}>{applicant.location}</p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px" }}>
            <h4 style={{ margin: "0 0 15px 0" }}>🛠️ Skills</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {applicant.skills.map((skill, index) => (
                <span
                  key={index}
                  style={{
                    backgroundColor: "#e9ecef",
                    padding: "5px 12px",
                    borderRadius: "20px",
                    fontSize: "14px"
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Resume/CV */}
          <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px" }}>
            <h4 style={{ margin: "0 0 15px 0" }}>📄 Resume/CV</h4>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                📎 View Resume
              </button>
              <button
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                ⬇️ Download CV
              </button>
            </div>
          </div>

          {/* Status Actions */}
          <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px" }}>
            <h4 style={{ margin: "0 0 15px 0" }}>📊 Application Status</h4>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                onClick={() => onStatusChange(applicant.id, 'shortlisted')}
                disabled={applicant.status === 'shortlisted'}
                style={{
                  padding: "8px 16px",
                  backgroundColor: applicant.status === 'shortlisted' ? "#6c757d" : "#ffc107",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: applicant.status === 'shortlisted' ? "not-allowed" : "pointer"
                }}
              >
                ⭐ Shortlist
              </button>
              <button
                onClick={() => onStatusChange(applicant.id, 'interview')}
                disabled={applicant.status === 'interview'}
                style={{
                  padding: "8px 16px",
                  backgroundColor: applicant.status === 'interview' ? "#6c757d" : "#17a2b8",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: applicant.status === 'interview' ? "not-allowed" : "pointer"
                }}
              >
                📅 Schedule Interview
              </button>
              <button
                onClick={() => onStatusChange(applicant.id, 'hired')}
                disabled={applicant.status === 'hired'}
                style={{
                  padding: "8px 16px",
                  backgroundColor: applicant.status === 'hired' ? "#6c757d" : "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: applicant.status === 'hired' ? "not-allowed" : "pointer"
                }}
              >
                ✅ Hire
              </button>
              <button
                onClick={() => onStatusChange(applicant.id, 'rejected')}
                disabled={applicant.status === 'rejected'}
                style={{
                  padding: "8px 16px",
                  backgroundColor: applicant.status === 'rejected' ? "#6c757d" : "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: applicant.status === 'rejected' ? "not-allowed" : "pointer"
                }}
              >
                ❌ Reject
              </button>
            </div>
            <div style={{ marginTop: "15px", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "6px" }}>
              <strong>Current Status:</strong> <span style={{
                color: applicant.status === 'pending' ? '#ffc107' :
                       applicant.status === 'shortlisted' ? '#17a2b8' :
                       applicant.status === 'interview' ? '#007bff' :
                       applicant.status === 'hired' ? '#28a745' : '#dc3545'
              }}>{applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "30px" }}>
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
        </div>
      </div>
    </div>
  );
}

export default ApplicantModal;