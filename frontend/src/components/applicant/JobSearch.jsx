import React, { useState } from 'react';
import './JobSearch.css';
import { formatJobLocationText, isCoordinateLocation, getGoogleMapsLink } from '../../utils/locationUtils';

function JobSearch({ jobs, filters, onFilterChange, onApply, onSaveJob, onViewJob, savedJobs, smartMatchedJobs = [] }) {
  const [useSmartMatching, setUseSmartMatching] = useState(false);

  console.log("JobSearch DEBUG:", {
    totalJobs: jobs?.length,
    smartMatchedJobs: smartMatchedJobs?.length,
    useSmartMatching,
    jobs: jobs?.slice(0, 3)
  });

  // Use smart matched jobs or all jobs depending on the toggle
  const jobsToDisplay = useSmartMatching && smartMatchedJobs.length > 0 ? smartMatchedJobs : jobs;

  const filteredJobs = jobsToDisplay.filter(job => {
    const matchesSearch = !filters.search || job.job_title.toLowerCase().includes(filters.search.toLowerCase()) || job.company?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesLocation = !filters.location || job.location.toLowerCase().includes(filters.location.toLowerCase());
    const matchesType = !filters.type || job.job_type === filters.type;

    return matchesSearch && matchesLocation && matchesType;
  });

  const isJobSaved = (jobId) => savedJobs.some(saved => saved.job_id === jobId || saved.id === jobId);

  return (
    <div className="job-search">
      <h2 style={{ fontSize: "2rem", marginBottom: "25px" }}>Find Jobs</h2>

      {/* Search Filters */}
      <div className="filter-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <h3 style={{ margin: 0 }}>🔧 Search Filters</h3>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "500", margin: 0, cursor: "pointer", padding: "8px 12px", backgroundColor: useSmartMatching ? "#e3f2fd" : "#f5f5f5", borderRadius: "6px", border: useSmartMatching ? "2px solid #2196f3" : "2px solid #ddd" }}>
            <input
              type="checkbox"
              checked={useSmartMatching}
              onChange={e => setUseSmartMatching(e.target.checked)}
              style={{ cursor: "pointer", width: "16px", height: "16px" }}
            />
            <span>Recommended Jobs</span>
          </label>
        </div>

        {useSmartMatching && (
          <div style={{ backgroundColor: "#e3f2fd", border: "1px solid #2196f3", borderRadius: "6px", padding: "10px 12px", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#1565c0" }}>
            <p style={{ margin: 0 }}>
              Showing recommended jobs based on your skills and location.
            </p>
          </div>
        )}

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

        </div>

        <div className="clear-filter-row">
          <button className="clear-btn"
            onClick={() => {
              onFilterChange("search", "");
              onFilterChange("location", "");
              onFilterChange("type", "");
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results Count - Only show when filtering or smart matching is active */}
      {(useSmartMatching || filters.search || filters.location || filters.type) && (
        <div className="result-count">
          <p>
            Found {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} matching your criteria
          </p>
        </div>
      )}

      {/* Job Listings */}
      <div className="job-listing">
        {filteredJobs.map((job, index) => (
          <div key={index} className="job-card">
            <div className="card-header">
              <div className="info">
                <h3>{job.job_title}</h3>
                <p>{job.company || "Company"}</p>
                <div className="tags">
                  <span
                    onClick={() => window.open(getGoogleMapsLink(job.location), '_blank')}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      fontSize: "14px",
                      color: "#007bff",
                      cursor: "pointer",
                      textDecoration: "underline"
                    }}
                  >
                    {formatJobLocationText(job.location)}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "14px" }}>
                    Salary: {job.salary || "N/A"}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "14px" }}>
                    Job Type: {job.job_type || "Full-time"}
                  </span>
                </div>
              </div>
              <div className="action-row">
                <button
                  className={`action-btn ${isJobSaved(job.job_id) ? 'saved' : 'save'}`}
                  onClick={() => onSaveJob(job.job_id || job.id)}
                  disabled={isJobSaved(job.job_id || job.id)}
                >
                  {isJobSaved(job.job_id || job.id) ? "💾 Saved" : "💾 Save"}
                </button>
                <button
                  className="action-btn view"
                  onClick={() => onViewJob ? onViewJob(job) : null}
                >
                  👁️ View Job
                </button>
                <button
                  className="action-btn apply"
                  onClick={() => onApply(job)}
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