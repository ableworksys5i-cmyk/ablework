import React from 'react';
import './Applications.css';

function Applications({ applications, onWithdrawApplication, onViewApplicationDetails }) {
  const statusCounts = {
    pending: applications.filter(app => app.status === 'pending').length,
    review: applications.filter(app => app.status === 'review').length,
    interview: applications.filter(app => app.status === 'interview').length,
    hired: applications.filter(app => app.status === 'hired').length,
    rejected: applications.filter(app => app.status === 'rejected').length
  };

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
    <div className="applications-wrapper">
      <h2>📋 My Applications</h2>

      {/* Status Summary */}
      <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#f9f9f9", marginBottom: "30px" }}>
        <h3 style={{ margin: "0 0 20px 0" }}>📊 Application Status Summary</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px" }}>
          <div style={{ textAlign: "center", padding: "15px", backgroundColor: "white", borderRadius: "8px", border: "1px solid #ddd" }}>
            <div style={{ fontSize: "2rem", marginBottom: "5px" }}>⏳</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{statusCounts.pending}</div>
            <div style={{ fontSize: "14px", color: "#666" }}>Pending</div>
          </div>
          <div style={{ textAlign: "center", padding: "15px", backgroundColor: "white", borderRadius: "8px", border: "1px solid #ddd" }}>
            <div style={{ fontSize: "2rem", marginBottom: "5px" }}>👀</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{statusCounts.review}</div>
            <div style={{ fontSize: "14px", color: "#666" }}>Under Review</div>
          </div>
          <div style={{ textAlign: "center", padding: "15px", backgroundColor: "white", borderRadius: "8px", border: "1px solid #ddd" }}>
            <div style={{ fontSize: "2rem", marginBottom: "5px" }}>📅</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{statusCounts.interview}</div>
            <div style={{ fontSize: "14px", color: "#666" }}>Interviews</div>
          </div>
          <div style={{ textAlign: "center", padding: "15px", backgroundColor: "white", borderRadius: "8px", border: "1px solid #ddd" }}>
            <div style={{ fontSize: "2rem", marginBottom: "5px" }}>✅</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{statusCounts.hired}</div>
            <div style={{ fontSize: "14px", color: "#666" }}>Hired</div>
          </div>
          <div style={{ textAlign: "center", padding: "15px", backgroundColor: "white", borderRadius: "8px", border: "1px solid #ddd" }}>
            <div style={{ fontSize: "2rem", marginBottom: "5px" }}>❌</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{statusCounts.rejected}</div>
            <div style={{ fontSize: "14px", color: "#666" }}>Rejected</div>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div style={{ display: "grid", gap: "20px" }}>
        {applications.length > 0 ? (
          applications.map((application, index) => (
            <div key={index} style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#f9f9f9" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 5px 0", fontSize: "1.5rem" }}>{application.jobTitle}</h3>
                  <p style={{ margin: "0 0 10px 0", color: "#666", fontSize: "1.1rem" }}>{application.company}</p>
                  <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginBottom: "10px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "14px" }}>
                      📍 {application.location}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "14px" }}>
                      💰 {application.salary}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "14px" }}>
                      📅 Applied {new Date(application.appliedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
                  <span style={{
                    padding: "8px 16px",
                    borderRadius: "20px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "white",
                    backgroundColor: getStatusColor(application.status),
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                  }}>
                    {getStatusIcon(application.status)} {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </span>
                  {application.status === 'pending' && (
                    <button
                      onClick={() => onWithdrawApplication(application.id)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px"
                      }}
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </div>

              {/* Status-specific content */}
              {application.status === 'interview' && application.interviewDetails && (
                <div style={{ border: "1px solid #007bff", borderRadius: "8px", padding: "15px", backgroundColor: "#e7f3ff", marginBottom: "15px" }}>
                  <h4 style={{ margin: "0 0 10px 0", color: "#007bff" }}>📅 Interview Scheduled</h4>
                  <p style={{ margin: "0 0 5px 0" }}><strong>Date:</strong> {new Date(application.interviewDetails.date).toLocaleDateString()}</p>
                  <p style={{ margin: "0 0 5px 0" }}><strong>Time:</strong> {application.interviewDetails.time}</p>
                  <p style={{ margin: "0 0 5px 0" }}><strong>Type:</strong> {application.interviewDetails.type}</p>
                  {application.interviewDetails.location && (
                    <p style={{ margin: 0 }}><strong>Location:</strong> {application.interviewDetails.location}</p>
                  )}
                </div>
              )}

              {application.status === 'hired' && application.offerDetails && (
                <div style={{ border: "1px solid #28a745", borderRadius: "8px", padding: "15px", backgroundColor: "#e8f5e8", marginBottom: "15px" }}>
                  <h4 style={{ margin: "0 0 10px 0", color: "#28a745" }}>🎉 Offer Received!</h4>
                  <p style={{ margin: "0 0 5px 0" }}><strong>Salary:</strong> {application.offerDetails.salary}</p>
                  <p style={{ margin: "0 0 5px 0" }}><strong>Start Date:</strong> {new Date(application.offerDetails.startDate).toLocaleDateString()}</p>
                  <p style={{ margin: 0 }}><strong>Status:</strong> {application.offerDetails.status}</p>
                </div>
              )}

              {application.status === 'rejected' && application.feedback && (
                <div style={{ border: "1px solid #dc3545", borderRadius: "8px", padding: "15px", backgroundColor: "#fceaea", marginBottom: "15px" }}>
                  <h4 style={{ margin: "0 0 10px 0", color: "#dc3545" }}>💭 Feedback</h4>
                  <p style={{ margin: 0, fontStyle: "italic" }}>"{application.feedback}"</p>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button
                  onClick={() => onViewApplicationDetails(application.id)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  📄 View Details
                </button>
                {application.status === 'pending' && (
                  <button
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                  >
                    ✏️ Update Application
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", padding: "60px", border: "2px dashed #ddd", borderRadius: "12px", backgroundColor: "#f9f9f9" }}>
            <h3 style={{ margin: "0 0 10px 0", color: "#666" }}>No applications yet</h3>
            <p style={{ margin: "0 0 20px 0", color: "#666" }}>
              Start your job search to find opportunities and submit applications.
            </p>
            <button
              style={{ padding: "12px 24px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px" }}
            >
              🔍 Start Job Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Applications;