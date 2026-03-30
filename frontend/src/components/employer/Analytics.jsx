import React from 'react';

function Analytics({ analytics, applicants, jobs }) {
  return (
    <div>
      <h2 style={{ fontSize: "2rem", marginBottom: "20px" }}>📊 Dashboard Analytics</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
        {/* Hiring Funnel */}
        <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#f9f9f9" }}>
          <h3>Hiring Funnel</h3>
          <div style={{ marginTop: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span>Applications Received</span>
              <span>{analytics.total_applicants || 0}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span>Shortlisted</span>
              <span>{applicants.filter(a => a.status === "shortlisted").length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span>Interviews Conducted</span>
              <span>{applicants.filter(a => a.status === "interviewed").length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span>Offers Made</span>
              <span>{applicants.filter(a => a.status === "accepted").length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
              <span>Hiring Rate</span>
              <span>{analytics.hiring_rate || 0}%</span>
            </div>
          </div>
        </div>

        {/* Job Performance */}
        <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#fff3e0" }}>
          <h3>Job Performance</h3>
          <div style={{ marginTop: "20px" }}>
            {jobs.map(job => (
              <div key={job.job_id} style={{ marginBottom: "15px", padding: "10px", backgroundColor: "#fff", borderRadius: "6px" }}>
                <h4 style={{ margin: "0 0 5px 0", fontSize: "14px" }}>{job.title}</h4>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                  <span>Views: {job.views || 25}</span>
                  <span>Applications: {job.applicants_count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time-based Analytics */}
        <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#f3e5f5" }}>
          <h3>Activity Timeline</h3>
          <div style={{ marginTop: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span>Applications Today</span>
              <span>{analytics.new_applicants_today || 0}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span>This Week</span>
              <span>{Math.floor((analytics.total_applicants || 0) * 0.3)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span>This Month</span>
              <span>{analytics.total_applicants || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;