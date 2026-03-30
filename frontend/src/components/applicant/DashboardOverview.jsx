import React from 'react';
import './DashboardOverview.css';

function DashboardOverview({ user, applications, savedJobs, onTabChange }) {
  const stats = {
    totalApplications: applications.length,
    pendingApplications: applications.filter(app => app.status === 'pending').length,
    interviews: applications.filter(app => app.status === 'interview').length,
    savedJobs: savedJobs.length
  };

  const recentApplications = applications.slice(0, 3);

  return (
    <div className="dashboard-overview">
      <h2>👋 Welcome back, {user.name}!</h2>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3 style={{ margin: "0 0 10px 0", fontSize: "2.5rem" }}>📄</h3>
          <h4 style={{ margin: "0 0 5px 0" }}>{stats.totalApplications}</h4>
          <p style={{ margin: 0, color: "#666" }}>Total Applications</p>
        </div>

        <div className="stat-card">
          <h3>⏳</h3>
          <h4>{stats.pendingApplications}</h4>
          <p>Pending Review</p>
        </div>

        <div className="stat-card">
          <h3>📅</h3>
          <h4>{stats.interviews}</h4>
          <p>Interviews Scheduled</p>
        </div>

        <div className="stat-card">
          <h3>💾</h3>
          <h4>{stats.savedJobs}</h4>
          <p>Saved Jobs</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>⚡ Quick Actions</h3>
        <div className="action-row">
          <button className="action-btn primary" onClick={() => onTabChange('search')}>

            🔍 Search Jobs
          </button>
          <button className="action-btn success" onClick={() => onTabChange('profile')}>
            📝 Update Profile
          </button>
          <button className="action-btn warning" onClick={() => onTabChange('applications')}>
            📋 View Applications
          </button>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="recent-applications">
        <h3>📋 Recent Applications</h3>
        {recentApplications.length > 0 ? (
          <div className="application-list">
            {recentApplications.map((app, index) => (
              <div key={index} className="application-item">
                <div>
                  <h4>{app.jobTitle}</h4>
                  <p className="meta-text">{app.company}</p>
                  <p className="meta-text">Applied on {new Date(app.appliedDate).toLocaleDateString()}</p>
                </div>
                <div className="status-cell">
                  <span className="application-status" style={{ backgroundColor: app.status === 'pending' ? '#ffc107' : app.status === 'interview' ? '#007bff' : app.status === 'hired' ? '#28a745' : '#dc3545' }}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, textAlign: "center", color: "#666", padding: "40px" }}>
            No applications yet. Start by searching for jobs!
          </p>
        )}
      </div>
    </div>
  );
}

export default DashboardOverview;