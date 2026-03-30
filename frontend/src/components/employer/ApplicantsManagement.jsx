import React from 'react';

function ApplicantsManagement({
  applicants,
  selectedJob,
  onClearFilter,
  onViewApplicant,
  onApplicantAction
}) {
  return (
    <div>
      <h2 style={{ fontSize: "2rem", marginBottom: "20px" }}>👥 Applicant Management</h2>

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

      <div style={{ display: "grid", gap: "15px" }}>
        {applicants
          .filter(app => !selectedJob || app.job_id === selectedJob.job_id)
          .map(applicant => (
          <div key={applicant.application_id} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "15px", backgroundColor: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: "0 0 5px 0" }}>{applicant.applicant_name}</h4>
                <p style={{ margin: "5px 0", color: "#666" }}>{applicant.job_title} • Applied {applicant.applied_date}</p>
                <div style={{ display: "flex", gap: "15px", marginTop: "10px" }}>
                  <span>🎯 {applicant.match_score}% match</span>
                  <span>📏 {applicant.distance}km away</span>
                  <span>💼 {applicant.experience}</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-end" }}>
                <span style={{
                  padding: "5px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "white",
                  backgroundColor:
                    applicant.status === "pending" ? "#ffc107" :
                    applicant.status === "shortlisted" ? "#17a2b8" :
                    applicant.status === "interviewed" ? "#007bff" :
                    applicant.status === "accepted" ? "#28a745" : "#dc3545"
                }}>
                  {applicant.status.toUpperCase()}
                </span>
                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => onViewApplicant(applicant)}
                    style={{ padding: "6px 12px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                  >
                    👁️ View
                  </button>
                  {applicant.status === "pending" && (
                    <>
                      <button
                        onClick={() => onApplicantAction(applicant.application_id, "shortlisted")}
                        style={{ padding: "6px 12px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                      >
                        ✓ Shortlist
                      </button>
                      <button
                        onClick={() => onApplicantAction(applicant.application_id, "rejected")}
                        style={{ padding: "6px 12px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                      >
                        ✕ Reject
                      </button>
                    </>
                  )}
                  {applicant.status === "shortlisted" && (
                    <>
                      <button
                        onClick={() => onApplicantAction(applicant.application_id, "interviewed")}
                        style={{ padding: "6px 12px", backgroundColor: "#17a2b8", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                      >
                        📅 Interview
                      </button>
                      <button
                        onClick={() => onApplicantAction(applicant.application_id, "rejected")}
                        style={{ padding: "6px 12px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                      >
                        ✕ Reject
                      </button>
                    </>
                  )}
                  {applicant.status === "interviewed" && (
                    <>
                      <button
                        onClick={() => onApplicantAction(applicant.application_id, "accepted")}
                        style={{ padding: "12px 24px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
                      >
                        💼 Offer
                      </button>
                      <button
                        onClick={() => onApplicantAction(applicant.application_id, "rejected")}
                        style={{ padding: "6px 12px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                      >
                        ✕ Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ApplicantsManagement;