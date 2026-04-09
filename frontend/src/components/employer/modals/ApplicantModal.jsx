import React from 'react';
import { API_URL } from '../../../api/api';

function ApplicantModal({ selectedApplicant, setShowApplicantModal, handleApplicantAction, setShowInterviewModal }) {
  if (!selectedApplicant) return null;

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
            onClick={() => setShowApplicantModal(false)}
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
              {selectedApplicant.applicant_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 style={{ margin: "0 0 5px 0", fontSize: "24px" }}>{selectedApplicant.applicant_name}</h3>
              <p style={{ margin: "0 0 5px 0", color: "#666" }}>{selectedApplicant.applicant_email}</p>
              <p style={{ margin: 0, color: "#666" }}>{selectedApplicant.disability_type || 'No disability info'}</p>
            </div>
          </div>

          {/* Application Details */}
          <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px" }}>
            <h4 style={{ margin: "0 0 15px 0" }}>📋 Application Details</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div>
                <strong>Applied Position:</strong>
                <p style={{ margin: "5px 0 0 0" }}>{selectedApplicant.job_title}</p>
              </div>
              <div>
                <strong>Applied Date:</strong>
                <p style={{ margin: "5px 0 0 0" }}>{new Date(selectedApplicant.applied_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Skills */}
          {selectedApplicant.skills && (
            <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px" }}>
              <h4 style={{ margin: "0 0 15px 0" }}>🛠️ Skills</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {selectedApplicant.skills.split(',').map((skill, index) => (
                  <span
                    key={index}
                    style={{
                      backgroundColor: "#e9ecef",
                      padding: "5px 12px",
                      borderRadius: "20px",
                      fontSize: "14px"
                    }}
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {selectedApplicant.education && (
            <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px" }}>
              <h4 style={{ margin: "0 0 15px 0" }}>🎓 Education</h4>
              <p>{selectedApplicant.education}</p>
            </div>
          )}

          {/* Resume/CV */}
          <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px" }}>
            <h4 style={{ margin: "0 0 15px 0" }}>📄 Resume/CV</h4>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {selectedApplicant.custom_resume ? (
                <button
                  onClick={() => window.open(`${API_URL}/uploads/resumes/${selectedApplicant.custom_resume}`, '_blank')}
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
              ) : (
                <span>No resume uploaded</span>
              )}
            </div>
          </div>

          {/* PWD Verification */}
          <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px" }}>
            <h4 style={{ margin: "0 0 15px 0" }}>🆔 PWD Verification</h4>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {selectedApplicant.pwd_verification ? (
                <button
                  onClick={() => window.open(`${API_URL}/uploads/pwd_verification/${selectedApplicant.pwd_verification}`, '_blank')}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  👁️ View Document
                </button>
              ) : (
                <span>No PWD verification uploaded</span>
              )}
            </div>
          </div>

          {/* Interview Details */}
          {selectedApplicant.status === 'interview' && selectedApplicant.interview_details && (
            <div style={{ border: "1px solid #bee5eb", borderRadius: "8px", padding: "20px", backgroundColor: "#d1ecf1" }}>
              <h4 style={{ margin: "0 0 15px 0", color: "#0c5460" }}>📅 Interview Scheduled</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", color: "#0c5460" }}>
                <div>
                  <strong>Date:</strong>
                  <p style={{ margin: "5px 0 0 0" }}>{selectedApplicant.interview_details.interview_date ? new Date(selectedApplicant.interview_details.interview_date).toLocaleDateString() : "TBD"}</p>
                </div>
                <div>
                  <strong>Time:</strong>
                  <p style={{ margin: "5px 0 0 0" }}>{selectedApplicant.interview_details.interview_time ? new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(`2000-01-01T${selectedApplicant.interview_details.interview_time}`)) : "TBD"}</p>
                </div>
                <div>
                  <strong>Type:</strong>
                  <p style={{ margin: "5px 0 0 0" }}>{selectedApplicant.interview_details.interview_type || "TBD"}</p>
                </div>
                {selectedApplicant.interview_details.notes && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <strong>Notes:</strong>
                    <p style={{ margin: "5px 0 0 0" }}>{selectedApplicant.interview_details.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status Actions */}
          <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px" }}>
            <h4 style={{ margin: "0 0 15px 0" }}>📊 Application Status</h4>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {selectedApplicant.status !== 'shortlisted' && selectedApplicant.status !== 'interview' && selectedApplicant.status !== 'archived' && (
                <button
                  onClick={() => handleApplicantAction(selectedApplicant.application_id, 'shortlisted')}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#ffc107",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  ⭐ Shortlist
                </button>
              )}
              {selectedApplicant.status === 'shortlisted' && selectedApplicant.status !== 'interview' && selectedApplicant.status !== 'archived' && (
                <button
                  onClick={() => setShowInterviewModal(true)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#17a2b8",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  📅 Schedule Interview
                </button>
              )}
              {selectedApplicant.status === 'interview' && (
                <button
                  onClick={() => handleApplicantAction(selectedApplicant.application_id, "archived")}
                  style={{
                    padding: "8px 14px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px"
                  }}
                >
                  📁 Archive
                </button>
              )}
              {selectedApplicant.status !== 'rejected' && selectedApplicant.status !== 'archived' && (
                <button
                  onClick={() => handleApplicantAction(selectedApplicant.application_id, 'rejected')}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  ❌ Reject
                </button>
              )}
            </div>
            <div style={{ marginTop: "15px", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "6px" }}>
              <strong>Current Status:</strong> <span style={{
                color: selectedApplicant.status === 'pending' ? '#ffc107' :
                       selectedApplicant.status === 'shortlisted' ? '#17a2b8' :
                       selectedApplicant.status === 'interview' ? '#007bff' :
                       selectedApplicant.status === 'archived' ? '#6c757d' : '#dc3545'
              }}>{selectedApplicant.status.charAt(0).toUpperCase() + selectedApplicant.status.slice(1)}</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "30px" }}>
          <button
            onClick={() => setShowApplicantModal(false)}
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