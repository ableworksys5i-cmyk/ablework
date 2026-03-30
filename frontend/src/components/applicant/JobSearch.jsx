import React from 'react';
import './JobSearch.css';

function JobSearch({ jobs, filters, onFilterChange, onApply, onSaveJob, savedJobs }) {
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !filters.search || job.job_title.toLowerCase().includes(filters.search.toLowerCase()) || job.company?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesLocation = !filters.location || job.location.toLowerCase().includes(filters.location.toLowerCase());
    const matchesType = !filters.type || job.job_type === filters.type;
    const matchesExperience = !filters.experience || job.experience === filters.experience;

    return matchesSearch && matchesLocation && matchesType && matchesExperience;
  });

  const isJobSaved = (jobId) => savedJobs.some(saved => saved.job_id === jobId);

  return (
    <div className="job-search">
      <h2>🔍 Job Search</h2>

      {/* Search Filters */}
      <div className="filter-panel">
        <h3>🔧 Search Filters</h3>
        <div className="filter-grid">
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Search Keywords</label>
            <input
              type="text"
              placeholder="Job title, company, or keywords"
              value={filters.search}
              onChange={e => onFilterChange("search", e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Location</label>
            <input
              type="text"
              placeholder="City, state, or remote"
              value={filters.location}
              onChange={e => onFilterChange("location", e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Job Type</label>
            <select
              value={filters.type}
              onChange={e => onFilterChange("type", e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
            >
              <option value="">All Types</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="freelance">Freelance</option>
              <option value="remote">Remote</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Experience Level</label>
            <select
              value={filters.experience}
              onChange={e => onFilterChange("experience", e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
            >
              <option value="">All Levels</option>
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
              <option value="executive">Executive</option>
            </select>
          </div>
        </div>

        <div className="clear-filter-row">
          <button className="clear-btn"
            onClick={() => {
              onFilterChange("search", "");
              onFilterChange("location", "");
              onFilterChange("type", "");
              onFilterChange("experience", "");
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="result-count">
        <p>
          Found {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} matching your criteria
        </p>
      </div>

      {/* Job Listings */}
      <div className="job-listing">
        {filteredJobs.map((job, index) => (
          <div key={index} className="job-card">
            <div className="card-header">
              <div className="info">
                <h3>{job.job_title}</h3>
                <p>{job.company || "Company"}</p>
                <div className="tags">
                  <span className="tag">
                    📍 {job.location}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "14px" }}>
                    💰 {job.salary || "N/A"}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "14px" }}>
                    🕒 {job.job_type || "Full-time"}
                  </span>
                </div>
              </div>
              <div className="action-row">
                <button
                  className={`action-btn ${isJobSaved(job.job_id) ? 'saved' : 'save'}`}
                  onClick={() => onSaveJob(job.job_id)}
                  disabled={isJobSaved(job.job_id)}
                >
                  {isJobSaved(job.job_id) ? "💾 Saved" : "💾 Save"}
                </button>
                <button
                  className="action-btn apply"
                  onClick={() => onApply(job.job_id)}
                >
                  📤 Apply Now
                </button>
              </div>
            </div>

            <p className="job-description">
              {job.job_description && job.job_description.length > 200 ? `${job.job_description.substring(0, 200)}...` : job.job_description || "No description available"}
            </p>

            <div className="job-meta">
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {job.job_category ? (
                  <span
                    style={{
                      backgroundColor: "#e9ecef",
                      padding: "3px 8px",
                      borderRadius: "12px",
                      fontSize: "12px"
                    }}
                  >
                    {job.job_category}
                  </span>
                ) : null}
                {job.skills && job.skills.length > 0 ? job.skills.slice(0, 2).map((skill, skillIndex) => (
                  <span
                    key={skillIndex}
                    style={{
                      backgroundColor: "#e9ecef",
                      padding: "3px 8px",
                      borderRadius: "12px",
                      fontSize: "12px"
                    }}
                  >
                    {skill}
                  </span>
                )) : null}
                {(!job.skills || job.skills.length === 0) && !job.job_category && (
                  <span style={{ fontSize: "12px", color: "#666" }}>
                    No skills specified
                  </span>
                )}
              </div>
              <span style={{ fontSize: "14px", color: "#666" }}>
                Posted {job.created_at ? new Date(job.created_at).toLocaleDateString() : "Recently"}
              </span>
            </div>
          </div>
        ))}

        {filteredJobs.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px", border: "2px dashed #ddd", borderRadius: "12px", backgroundColor: "#f9f9f9" }}>
            <h3 style={{ margin: "0 0 10px 0", color: "#666" }}>No jobs found</h3>
            <p style={{ margin: 0, color: "#666" }}>Try adjusting your search filters to find more opportunities.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default JobSearch;