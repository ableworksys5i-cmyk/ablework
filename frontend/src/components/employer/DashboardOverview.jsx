import React from 'react';

function DashboardOverview({ employer, jobs, applicants, setShowJobModal, setActiveTab }) {
  // Calculate analytics from the data
  const analytics = {
    total_applicants: applicants?.length || 0,
    active_jobs: jobs?.filter(job => job.status === 'active').length || 0,
    job_views: jobs?.reduce((total, job) => total + (job.views || 0), 0) || 0
  };

  return (
    <div>
      <h2 style={{ fontSize: "2rem", marginBottom: "20px" }}><p>Welcome back, {employer.company_name || "Employer"}!</p></h2>

      {/* Analytics Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#e0f7fa", textAlign: "center" }}>
          <h3>Total Applications</h3>
          <p style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{analytics.total_applicants}</p>
        </div>
        <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#fff3e0", textAlign: "center" }}>
          <h3>Active Jobs</h3>
          <p style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{analytics.active_jobs}</p>
        </div>
        <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#f3e5f5", textAlign: "center" }}>
          <h3>Total Jobs Posted</h3>
          <p style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{jobs?.length || 0}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#fff" }}>
        <h3>Recent Activity</h3>
        <div style={{ marginTop: "15px" }}>
          {applicants?.slice(0, 5).map(applicant => (
            <div key={applicant.application_id} style={{ padding: "10px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between" }}>
              <span>Application for {applicant.job_title}</span>
              <small style={{ color: "#666" }}>{applicant.applied_date}</small>
            </div>
          ))}
          {(!applicants || applicants.length === 0) && (
            <p style={{ color: "#666", fontStyle: "italic" }}>No recent applications</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;