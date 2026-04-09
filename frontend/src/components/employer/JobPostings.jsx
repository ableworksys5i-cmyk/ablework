import React, { useState } from 'react';

function JobPostings({ jobs, setShowJobModal, setSelectedJob, setActiveTab, setJobForm, onStatusToggle }) {
  const [filter, setFilter] = useState("all");
  const filteredJobs = jobs.filter(job => filter === "archived" ? job.status === "archived" : job.status !== "archived");

  return (
    <div>
      <h2 style={{ fontSize: "2rem", marginBottom: "20px" }}>📢 Job Postings</h2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "20px", alignItems: "center" }}>
        <button
          onClick={() => {
            setJobForm({
              title: "",
              description: "",
              requirements: "",
              required_skills: "",
              salary: "",
              location: "",
              latitude: "",
              longitude: "",
              job_radius: 10,
              job_type: "full-time",
              category: "",
              status: "active"
            });
            setShowJobModal(true);
          }}
          style={{
            padding: "10px 18px",
            borderRadius: "6px",
            border: "2px solid #28a745",
            backgroundColor: "#28a745",
            color: "white",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          ➕ Post New Job
        </button>
        <button
          onClick={() => setFilter("all")}
          style={{
            padding: "10px 18px",
            borderRadius: "6px",
            border: filter === "all" ? "2px solid #007bff" : "1px solid #ccc",
            backgroundColor: filter === "all" ? "#007bff" : "white",
            color: filter === "all" ? "white" : "#333",
            cursor: "pointer"
          }}
        >
          All Jobs
        </button>
        <button
          onClick={() => setFilter("archived")}
          style={{
            padding: "10px 18px",
            borderRadius: "6px",
            border: filter === "archived" ? "2px solid #007bff" : "1px solid #ccc",
            backgroundColor: filter === "archived" ? "#007bff" : "white",
            color: filter === "archived" ? "white" : "#333",
            cursor: "pointer"
          }}
        >
          Archived Jobs
        </button>
        <span style={{ marginLeft: "auto", color: "#666" }}>{filteredJobs.length} {filter === "archived" ? "archived" : "total"} job{filteredJobs.length === 1 ? "" : "s"}</span>
      </div>

      <div style={{ display: "grid", gap: "20px" }}>
        {filteredJobs.length === 0 ? (
          <div style={{ padding: "20px", border: "1px dashed #ccc", borderRadius: "8px", backgroundColor: "#fafafa", color: "#555" }}>
            No {filter === "archived" ? "archived" : "available"} jobs found.
          </div>
        ) : (
          filteredJobs.map(job => (
            <div key={job.job_id} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px", backgroundColor: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 10px 0" }}>{job.title}</h3>
                  <p style={{ margin: "5px 0", color: "#666" }}>{job.location} • Posted {job.posted_date}</p>
                  <p style={{ margin: "10px 0" }}>{job.description}</p>
                  <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginTop: "10px" }}>
                    <span>${job.salary}</span>
                    <span>{job.job_type}</span>
                    <span>{job.category}</span>
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
                    View Applicants ({job.applicants_count})
                  </button>
                  <button
                    onClick={() => {
                      // Set job form for editing
                      setJobForm({
                        title: job.title,
                        description: job.description,
                        requirements: job.requirements,
                        required_skills: job.required_skills || "",
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
                    Edit Job
                  </button>
                  <button
                    onClick={() => {
                      if (typeof onStatusToggle === "function") {
                        onStatusToggle(job);
                      }
                    }}
                    style={{ padding: "8px 16px", backgroundColor: job.status === "active" ? "#dc3545" : "#28a745", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
                  >
                    {job.status === "active" ? "Archive" : "Reactivate"}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default JobPostings;