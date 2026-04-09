import React from 'react';

function ApplicationDetailsModal({ isOpen, onClose, application, onWithdrawApplication }) {
  if (!isOpen || !application) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'review': return '#17a2b8';
      case 'interview': return '#007bff';
      case 'hired': return '#28a745';
      case 'rejected': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'review': return '👀';
      case 'interview': return '📅';
      case 'hired': return '✅';
      case 'rejected': return '❌';
      default: return '❓';
    }
  };

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
          <h2 style={{ margin: 0 }}>📋 Application Details</h2>
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
          {/* Application Status */}
          <div style={{
            border: `2px solid ${getStatusColor(application.status)}`,
            borderRadius: "8px",
            padding: "20px",
            backgroundColor: "#f8f9fa"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "15px" }}>
              <span style={{ fontSize: "2rem" }}>{getStatusIcon(application.status)}</span>
              <div>
                <h3 style={{ margin: "0 0 5px 0" }}>Status: {application.status.charAt(0).toUpperCase() + application.status.slice(1)}</h3>
                <p style={{ margin: 0, color: "#666" }}>
                  Applied on {new Date(application.appliedDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {application.status === 'shortlisted' && (
              <div style={{ backgroundColor: "#d1ecf1", border: "1px solid #bee5eb", borderRadius: "6px", padding: "15px", marginTop: "15px" }}>
                <h4 style={{ margin: "0 0 10px 0", color: "#0c5460" }}>⭐ Congratulations! You've Been Shortlisted</h4>
                <p style={{ margin: 0 }}>Your application has been shortlisted by the employer. They may contact you soon to schedule an interview.</p>
              </div>
            )}

            {application.status === 'interview' && application.interviewDetails && (
              <div style={{ backgroundColor: "#d1ecf1", border: "1px solid #bee5eb", borderRadius: "6px", padding: "15px", marginTop: "15px" }}>
                <h4 style={{ margin: "0 0 10px 0", color: "#0c5460" }}>📅 Interview Scheduled</h4>
                <p style={{ margin: "0 0 5px 0" }}><strong>Date:</strong> {new Date(application.interviewDetails.date).toLocaleDateString()}</p>
                <p style={{ margin: "0 0 5px 0" }}><strong>Time:</strong> {application.interviewDetails.time ? new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(`2000-01-01T${application.interviewDetails.time}`)) : "TBD"}</p>
                <p style={{ margin: "0 0 5px 0" }}><strong>Type:</strong> {application.interviewDetails.type}</p>
                {application.interviewDetails.location && (
                  <p style={{ margin: 0 }}><strong>Location:</strong> {application.interviewDetails.location}</p>
                )}
                {application.interviewDetails.notes && (
                  <p style={{ margin: "10px 0 0 0", color: "#0c5460" }}><strong>What to bring:</strong> {application.interviewDetails.notes}</p>
                )}
              </div>
            )}

            {application.status === 'hired' && application.offerDetails && (
              <div style={{ backgroundColor: "#d4edda", border: "1px solid #c3e6cb", borderRadius: "6px", padding: "15px", marginTop: "15px" }}>
                <h4 style={{ margin: "0 0 10px 0", color: "#155724" }}>🎉 Congratulations! You've been hired!</h4>
                <p style={{ margin: "0 0 5px 0" }}><strong>Salary:</strong> {application.offerDetails.salary}</p>
                <p style={{ margin: "0 0 5px 0" }}><strong>Start Date:</strong> {new Date(application.offerDetails.startDate).toLocaleDateString()}</p>
                <p style={{ margin: 0 }}><strong>Status:</strong> {application.offerDetails.status}</p>
              </div>
            )}

            {application.status === 'rejected' && application.feedback && (
              <div style={{ backgroundColor: "#f8d7da", border: "1px solid #f5c6cb", borderRadius: "6px", padding: "15px", marginTop: "15px" }}>
                <h4 style={{ margin: "0 0 10px 0", color: "#721c24" }}>💭 Feedback</h4>
                <p style={{ margin: 0, fontStyle: "italic" }}>"{application.feedback}"</p>
              </div>
            )}
          </div>

          {/* Job Information */}
          <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px" }}>
            <h4 style={{ margin: "0 0 15px 0" }}>💼 Job Information</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div>
                <strong>Position:</strong>
                <p style={{ margin: "5px 0 0 0" }}>{application.jobTitle}</p>
              </div>
              <div>
                <strong>Company:</strong>
                <p style={{ margin: "5px 0 0 0" }}>{application.company}</p>
              </div>
              <div>
                <strong>Location:</strong>
                <p style={{ margin: "5px 0 0 0" }}>{application.location}</p>
              </div>
              <div>
                <strong>Salary:</strong>
                <p style={{ margin: "5px 0 0 0" }}>{application.salary}</p>
              </div>
            </div>
          </div>

          {/* Application Materials */}
          <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px" }}>
            <h4 style={{ margin: "0 0 15px 0" }}>📄 Application Materials</h4>
            <div style={{ display: "grid", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>📎 Resume/CV</span>
                <button
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  View
                </button>
              </div>
              {application.coverLetter && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>📝 Cover Letter</span>
                  <button
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                  >
                    View
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px" }}>
            <h4 style={{ margin: "0 0 15px 0" }}>📊 Application Timeline</h4>
            <div style={{ display: "grid", gap: "15px" }}>
              <div style={{ display: "flex", gap: "15px", alignItems: "flex-start" }}>
                <div style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: "#28a745",
                  marginTop: "6px",
                  flexShrink: 0
                }}></div>
                <div>
                  <p style={{ margin: "0 0 5px 0", fontWeight: "bold" }}>Application Submitted</p>
                  <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                    {new Date(application.appliedDate).toLocaleDateString()} at {new Date(application.appliedDate).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {application.status !== 'pending' && (
                <div style={{ display: "flex", gap: "15px", alignItems: "flex-start" }}>
                  <div style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: getStatusColor(application.status),
                    marginTop: "6px",
                    flexShrink: 0
                  }}></div>
                  <div>
                    <p style={{ margin: "0 0 5px 0", fontWeight: "bold" }}>
                      Status Updated to {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </p>
                    <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                      {application.lastUpdated ? new Date(application.lastUpdated).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "30px" }}>
          {application.status === 'pending' && (
            <button
              onClick={() => onWithdrawApplication(application.id)}
              style={{
                padding: "10px 20px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Withdraw Application
            </button>
          )}
          <div style={{ marginLeft: "auto" }}>
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
    </div>
  );
}

export default ApplicationDetailsModal;