import React, { useState } from 'react';

const API_URL = "http://localhost:3000";

function ApplicantsManagement({
  applicants,
  selectedJob,
  onClearFilter,
  onViewApplicant,
  onApplicantAction,
  onScheduleInterview,
  onPwdVerificationAction
}) {
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredByJob = applicants.filter(app => !selectedJob || app.job_id === selectedJob.job_id);
  const statusCounts = {
    all: filteredByJob.filter(app => !['shortlisted', 'interview', 'accepted', 'rejected'].includes(app.status)).length,
    shortlisted: filteredByJob.filter(app => app.status === 'shortlisted').length,
    interview: filteredByJob.filter(app => app.status === 'interview').length,
    accepted: filteredByJob.filter(app => app.status === 'accepted').length,
    rejected: filteredByJob.filter(app => app.status === 'rejected').length
  };
  const displayedApplicants = filteredByJob.filter(app =>
    filterStatus === 'all'
      ? !['shortlisted', 'interview', 'accepted', 'rejected'].includes(app.status)
      : app.status === filterStatus
  );

  return (
    <div>
      <h2 style={{ fontSize: "2rem", marginBottom: "20px" }}>👥 Applicant Management</h2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
        {[
          { key: 'all', label: 'All', count: statusCounts.all },
          { key: 'shortlisted', label: 'Shortlisted', count: statusCounts.shortlisted },
          { key: 'interview', label: 'Interview', count: statusCounts.interview },
          { key: 'accepted', label: 'Accepted', count: statusCounts.accepted },
          { key: 'rejected', label: 'Rejected', count: statusCounts.rejected }
        ].map(section => (
          <button
            key={section.key}
            onClick={() => setFilterStatus(section.key)}
            style={{
              padding: "10px 16px",
              borderRadius: "999px",
              border: filterStatus === section.key ? "2px solid #007bff" : "1px solid #ccc",
              backgroundColor: filterStatus === section.key ? "#007bff" : "#f7f7f7",
              color: filterStatus === section.key ? "white" : "#333",
              cursor: "pointer"
            }}
          >
            {section.label} ({section.count})
          </button>
        ))}
      </div>

      {selectedJob && (
        <div style={{ border: "2px solid #007bff", borderRadius: "12px", padding: "15px", marginBottom: "20px", backgroundColor: "#e3f2fd" }}>
          <h3>Viewing applicants for: {selectedJob.title}</h3>
          <button
            onClick={onClearFilter}
            style={{ marginTop: "10px", padding: "6px 12px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Clear Filter
          </button>
        </div>
      )}

      <div style={{ display: "grid", gap: "20px" }}>
        {displayedApplicants.map(applicant => (
          <div key={applicant.application_id} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px", backgroundColor: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
            {/* Header Section */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px", paddingBottom: "15px", borderBottom: "2px solid #f0f0f0" }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: "0 0 5px 0", fontSize: "18px" }}>{applicant.applicant_name}</h4>
                <p style={{ margin: "5px 0 0 0", color: "#666", fontSize: "14px" }}>{applicant.job_title} • Applied {applicant.applied_date}</p>
              </div>
              <span style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "bold",
                color: "white",
                backgroundColor:
                  applicant.status === "pending" ? "#ffc107" :
                  applicant.status === "shortlisted" ? "#17a2b8" :
                  applicant.status === "interview" ? "#007bff" :
                  applicant.status === "accepted" ? "#28a745" :
                  applicant.status === "archived" ? "#6c757d" : "#dc3545"
              }}>
                {applicant.status.toUpperCase()}
              </span>
            </div>

            {/* Interview Details - Show when status is interview */}
            {applicant.status === "interview" && applicant.interview_details && (
              <div style={{ padding: "12px", backgroundColor: "#d1ecf1", borderRadius: "6px", border: "1px solid #bee5eb", marginBottom: "15px" }}>
                <div style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "8px", color: "#0c5460" }}>📅 Interview Scheduled</div>
                <div style={{ fontSize: "13px", color: "#0c5460", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <strong>Date:</strong> {applicant.interview_details.interview_date ? new Date(applicant.interview_details.interview_date).toLocaleDateString() : "TBD"}
                  </div>
                  <div>
                    <strong>Time:</strong> {applicant.interview_details.interview_time ? new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(`2000-01-01T${applicant.interview_details.interview_time}`)) : "TBD"}
                  </div>
                  <div>
                    <strong>Type:</strong> {applicant.interview_details.interview_type || "TBD"}
                  </div>
                  {applicant.interview_details.notes && (
                    <div style={{ gridColumn: "1 / -1" }}>
                      <strong>Notes:</strong> {applicant.interview_details.notes}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Documents Section */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px", paddingBottom: "15px", borderBottom: "1px solid #f0f0f0" }}>
              {/* Resume Section */}
              <div style={{ padding: "12px", backgroundColor: "#f8f9fa", borderRadius: "6px", border: "1px solid #dee2e6" }}>
                <div style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "8px" }}>📄 Resume</div>
                {applicant.custom_resume ? (
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", color: "#666" }}>✓ Uploaded</span>
                    <button
                      onClick={() => window.open(`${API_URL}/uploads/resumes/${applicant.custom_resume}`, '_blank')}
                      style={{ padding: "4px 10px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}
                    >
                      👁️ View
                    </button>
                  </div>
                ) : (
                  <span style={{ fontSize: "13px", color: "#999" }}>❌ No custom resume</span>
                )}
              </div>

              {/* PWD Verification Section */}
              <div style={{ padding: "12px", backgroundColor: "#f8f9fa", borderRadius: "6px", border: "1px solid #dee2e6" }}>
                <div style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "8px" }}>🆔 PWD Verification</div>
                
                {applicant.pwd_verification ? (
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      onClick={() => window.open(`${API_URL}/uploads/pwd_verification/${applicant.pwd_verification}`, '_blank')}
                      style={{ padding: "4px 10px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}
                    >
                      👁️ View
                    </button>
                  </div>
                ) : (
                  <span style={{ fontSize: "13px", color: "#999" }}>❌ No file uploaded</span>
                )}
              </div>
            </div>

            {/* Action Buttons Section */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                onClick={() => onViewApplicant(applicant)}
                style={{ padding: "8px 14px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
              >
                👁️ View Full Profile
              </button>
              {applicant.status === "pending" && (
                <>
                  <button
                    onClick={() => onApplicantAction(applicant.application_id, "shortlisted")}
                    style={{ padding: "8px 14px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                  >
                    ✓ Shortlist
                  </button>
                  <button
                    onClick={() => onApplicantAction(applicant.application_id, "rejected")}
                    style={{ padding: "8px 14px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                  >
                    ✕ Reject
                  </button>
                </>
              )}
              {applicant.status === "shortlisted" && (
                <>
                  <button
                    onClick={() => onScheduleInterview(applicant)}
                    style={{ padding: "8px 14px", backgroundColor: "#17a2b8", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                  >
                    📅 Interview
                  </button>
                  <button
                    onClick={() => onApplicantAction(applicant.application_id, "rejected")}
                    style={{ padding: "8px 14px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                  >
                    ✕ Reject
                  </button>
                </>
              )}
              {applicant.status === "interview" && (
                <>
                  <button
                    onClick={() => onApplicantAction(applicant.application_id, "accepted")}
                    style={{ padding: "8px 14px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                  >
                    ✓ Accept
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ApplicantsManagement;
