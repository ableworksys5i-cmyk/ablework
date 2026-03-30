import React from 'react';

function DashboardOverview({ analytics, notifications, onTabChange }) {
  return (
    <div>
      <h2 style={{ fontSize: "2rem", marginBottom: "20px" }}>📊 Dashboard Overview</h2>

      {/* Analytics Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#e0f7fa", textAlign: "center" }}>
          <h3>📄 Total Applications</h3>
          <p style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{analytics.total_applicants || 0}</p>
        </div>
        <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#fff3e0", textAlign: "center" }}>
          <h3>💼 Active Jobs</h3>
          <p style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{analytics.active_jobs || 0}</p>
        </div>
        <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#f3e5f5", textAlign: "center" }}>
          <h3>👁️ Job Views</h3>
          <p style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{analytics.job_views || 0}</p>
        </div>
        <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#e8f5e8", textAlign: "center" }}>
          <h3>🎯 Avg Match Score</h3>
          <p style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{analytics.average_match_score || 0}%</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", marginBottom: "30px", backgroundColor: "#f9f9f9" }}>
        <h3>🚀 Quick Actions</h3>
        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginTop: "15px" }}>
          <button
            onClick={() => onTabChange("jobs")}
            style={{ padding: "12px 24px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
          >
            📢 Post New Job
          </button>
          <button
            onClick={() => onTabChange("applicants")}
            style={{ padding: "12px 24px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
          >
            👥 View Applicants
          </button>
          <button
            onClick={() => onTabChange("matching")}
            style={{ padding: "12px 24px", backgroundColor: "#ffc107", color: "black", border: "none", borderRadius: "6px", cursor: "pointer" }}
          >
            🧠 Smart Matching
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#fff" }}>
        <h3>📈 Recent Activity</h3>
        <div style={{ marginTop: "15px" }}>
          {notifications.slice(0, 5).map(notification => (
            <div key={notification.id} style={{ padding: "10px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between" }}>
              <span>{notification.message}</span>
              <small style={{ color: "#666" }}>{notification.date}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;