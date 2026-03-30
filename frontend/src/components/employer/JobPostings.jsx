import React from 'react';

function JobPostings({ jobs, setShowJobModal, setSelectedJob, setActiveTab, setJobForm, onStatusToggle }) {
  return (
    <div>
      <h2 style={{ fontSize: "2rem", marginBottom: "20px" }}>📢 Job Postings</h2>

      <div style={{ marginBottom: "20px", textAlign: "right" }}>
        <button
          onClick={() => setShowJobModal(true)}
          style={{ padding: "12px 24px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "16px" }}
        >
          ➕ Create New Job
        </button>
      </div>

      <div style={{ display: "grid", gap: "20px" }}>
        {jobs.map(job => (
          <div key={job.job_id} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px", backgroundColor: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 10px 0" }}>{job.title}</h3>
                <p style={{ margin: "5px 0", color: "#666" }}>{job.location} • Posted {job.posted_date}</p>
                <p style={{ margin: "10px 0" }}>{job.description}</p>
                <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginTop: "10px" }}>
                  <span>💰 ${job.salary}</span>
                  <span>⏰ {job.job_type}</span>
                  <span>📂 {job.category}</span>
                  <span>📍 {job.job_radius}km radius</span>
                  <span>👥 {job.applicants_count} applicants</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <span style={{
                  padding: "5px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "white",
                  backgroundColor: job.status === "active" ? "#28a745" : "#6c757d"
                }}>
                  {job.status.toUpperCase()}
                </span>
                <button
                  onClick={() => {
                    setSelectedJob(job);
                    setActiveTab("applicants");
                  }}
                  style={{ padding: "8px 16px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
                >
                  👥 View Applicants ({job.applicants_count})
                </button>
                <button
                  onClick={() => {
                    // Set job form for editing
                    setJobForm({
                      title: job.title,
                      description: job.description,
                      requirements: job.requirements,
                      salary: job.salary,
                      location: job.location,
                      latitude: job.latitude || "",
                      longitude: job.longitude || "",
                      job_radius: job.job_radius,
                      job_type: job.job_type,
                      category: job.category,
                      status: job.status || "active",
                      id: job.job_id // Add id for editing
                    });
                    setShowJobModal(true);
                  }}
                  style={{ padding: "8px 16px", backgroundColor: "#ffc107", color: "black", border: "none", borderRadius: "6px", cursor: "pointer" }}
                >
                  ✏️ Edit Job
                </button>
                <button
                  onClick={() => {
                    if (typeof onStatusToggle === "function") {
                      onStatusToggle(job);
                    }
                  }}
                  style={{ padding: "8px 16px", backgroundColor: job.status === "active" ? "#dc3545" : "#28a745", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
                >
                  {job.status === "active" ? "🗃️ Archive" : "📤 Reactivate"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default JobPostings;