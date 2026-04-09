import React, { useEffect, useState } from 'react';
import { isCoordinateLocation, parseLocationCoordinates } from '../../../utils/locationUtils';
import { API_URL } from '../../../api/api';

function JobDetailsModal({ isOpen, onClose, job, onApply, onSaveJob, savedJobs }) {
  if (!isOpen || !job) return null;

  const [resolvedLocation, setResolvedLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(false);

  const jobTitle = job.job_title || job.title || "Untitled Job";
  const companyName = job.company || job.company_name || "Unknown Company";
  const companyLogo = job.company_logo || job.logo || job.employer_logo || job.companyLogo || null;
  const logoUrl = companyLogo ? `${API_URL}/uploads/logos/${companyLogo}` : null;
  const companyDescription = job.companyDescription || job.company_description || job.company_info || "Information about the company will be displayed here.";
  const companyAddress = job.company_address || job.address || "Not available";
  const companyWebsite = job.company_website || job.website || null;
  const companyPhone = job.company_phone || job.contact_number || job.phone || null;
  const companyEmail = job.company_email || job.email || null;
  const jobDescription = job.job_description || job.description || "No description available.";
  const jobPostedDate = job.postedDate || job.created_at || null;
  const jobType = job.job_type || job.type || "Not specified";
  const jobSalary = job.salary || job.compensation || "Not specified";
  const jobRequirements = job.requirements || "No requirements listed.";
  const jobSkillsRaw = job.required_skills || job.skills || job.skills_required || job.requiredSkills || "";
  const jobSkills = Array.isArray(jobSkillsRaw)
    ? jobSkillsRaw
    : (typeof jobSkillsRaw === 'string' ? jobSkillsRaw.split(',').map(s => s.trim()).filter(Boolean) : []);
  
  console.log("JobDetailsModal - Job data:", { job_id: job.job_id, job_title: job.job_title, required_skills: job.required_skills, jobSkills });

  useEffect(() => {
    if (!job || !isCoordinateLocation(job.location)) {
      setResolvedLocation(null);
      setLocationLoading(false);
      setLocationError(false);
      return;
    }

    const coords = parseLocationCoordinates(job.location);
    if (!coords) {
      setResolvedLocation(null);
      setLocationLoading(false);
      setLocationError(true);
      return;
    }

    let isMounted = true;
    const fetchAddress = async () => {
      setLocationLoading(true);
      setLocationError(false);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`,
          {
            headers: {
              'Accept': 'application/json'
            }
          }
        );
        const data = await response.json();
        if (!isMounted) return;
        const displayName = data?.display_name;
        if (displayName) {
          setResolvedLocation(displayName);
        } else {
          setLocationError(true);
        }
      } catch (error) {
        if (!isMounted) return;
        setLocationError(true);
      } finally {
        if (isMounted) setLocationLoading(false);
      }
    };

    fetchAddress();
    return () => {
      isMounted = false;
    };
  }, [job]);

  const isJobSaved = savedJobs.some(saved => saved.id === job.id || saved.job_id === job.job_id || saved.id === job.job_id || saved.job_id === job.id);

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "16px",
        width: "95%",
        maxWidth: "900px",
        maxHeight: "85vh",
        overflowY: "auto",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0 }}>💼 Job Details</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#666"
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: "grid", gap: "20px" }}>
          {/* Job Header - Facebook Style */}
          <div style={{ border: "1px solid #ddd", borderRadius: "12px", padding: "24px", backgroundColor: "#f8f9fa" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
              {/* Company Logo */}
              <div style={{
                width: "80px",
                height: "80px",
                borderRadius: "12px",
                backgroundColor: "#e9ecef",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                flexShrink: 0
              }}>
                {logoUrl ? (
                  <img
                    key={companyLogo}
                    src={logoUrl}
                    alt={`${companyName} logo`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover"
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div style={{
                  width: "100%",
                  height: "100%",
                  display: companyLogo ? "none" : "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  color: "#6c757d"
                }}>
                  🏢
                </div>
              </div>

              {/* Job Title and Company */}
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "1.8rem", color: "#333" }}>{jobTitle}</h3>
                <p style={{ margin: "0 0 4px 0", color: "#007bff", fontSize: "1.2rem", fontWeight: "500" }}>{companyName}</p>
                <p style={{ margin: 0, color: "#666", fontSize: "0.9rem" }}>
                  📅 Posted {jobPostedDate ? new Date(jobPostedDate).toLocaleDateString() : "Unknown date"}
                </p>
              </div>
            </div>

            {/* Job Meta Info */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>📍</span>
                <span style={{ fontSize: "0.95rem" }}>
                  {isCoordinateLocation(job.location)
                    ? locationLoading
                      ? 'Loading address...'
                      : locationError
                        ? job.location
                        : resolvedLocation || job.location
                    : job.location}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>💰</span>
                <span style={{ fontSize: "0.95rem" }}>{jobSalary}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>🕒</span>
                <span style={{ fontSize: "0.95rem" }}>{jobType}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                onClick={() => onApply(job.id)}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                📤 Apply Now
              </button>
              <button
                onClick={() => onSaveJob(job.id)}
                disabled={isJobSaved}
                style={{
                  padding: "12px 24px",
                  backgroundColor: isJobSaved ? "#6c757d" : "#ffc107",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: isJobSaved ? "not-allowed" : "pointer",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                {isJobSaved ? "💾 Saved" : "💾 Save Job"}
              </button>
            </div>
          </div>

          {/* Job Description */}
          <div style={{ border: "1px solid #e1e8ed", borderRadius: "12px", padding: "24px", backgroundColor: "white" }}>
            <h4 style={{ margin: "0 0 16px 0", fontSize: "1.3rem", color: "#333", fontWeight: "600" }}>📋 Job Description</h4>
            <p style={{ margin: 0, lineHeight: "1.6", color: "#555", fontSize: "1rem", whiteSpace: "pre-line" }}>{job.job_description || job.description}</p>
          </div>

          {/* Requirements */}
          <div style={{ border: "1px solid #e1e8ed", borderRadius: "12px", padding: "24px", backgroundColor: "white" }}>
            <h4 style={{ margin: "0 0 16px 0", fontSize: "1.3rem", color: "#333", fontWeight: "600" }}>✅ Requirements</h4>
            <p style={{ margin: 0, lineHeight: "1.6", color: "#555", fontSize: "1rem", whiteSpace: "pre-line" }}>{job.requirements}</p>
          </div>

          {/* Skills */}
          <div style={{ border: "1px solid #e1e8ed", borderRadius: "12px", padding: "24px", backgroundColor: "white" }}>
            <h4 style={{ margin: "0 0 16px 0", fontSize: "1.3rem", color: "#333", fontWeight: "600" }}>🛠️ Required Skills</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              {jobSkills.length > 0 ? (
                jobSkills.map((skill, index) => (
                  <span
                    key={index}
                    style={{
                      backgroundColor: "#f0f2f5",
                      padding: "10px 18px",
                      borderRadius: "24px",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#333",
                      border: "1px solid #e1e8ed"
                    }}
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p style={{ margin: 0, color: "#666", fontStyle: "italic" }}>No specific skills listed</p>
              )}
            </div>
          </div>

          {/* Company Info */}
          <div style={{ border: "1px solid #e1e8ed", borderRadius: "12px", padding: "24px", backgroundColor: "white" }}>
            <h4 style={{ margin: "0 0 16px 0", fontSize: "1.3rem", color: "#333", fontWeight: "600" }}>🏢 About {companyName}</h4>
            <div style={{ display: "grid", gap: "16px" }}>
              <p style={{ margin: 0, lineHeight: "1.6", color: "#555", fontSize: "1rem" }}>{companyDescription}</p>
              <div style={{ display: "grid", gap: "8px", gridTemplateColumns: "1fr 1fr" }}>
                <div style={{ fontSize: "0.95rem", color: "#555" }}><strong>Address:</strong> {companyAddress}</div>
                <div style={{ fontSize: "0.95rem", color: "#555" }}><strong>Website:</strong> {companyWebsite ? <a href={companyWebsite.startsWith('http') ? companyWebsite : `https://${companyWebsite}`} target="_blank" rel="noreferrer" style={{ color: "#007bff" }}>{companyWebsite}</a> : "Not available"}</div>
                <div style={{ fontSize: "0.95rem", color: "#555" }}><strong>Phone:</strong> {companyPhone || "Not available"}</div>
                <div style={{ fontSize: "0.95rem", color: "#555" }}><strong>Email:</strong> {companyEmail ? <a href={`mailto:${companyEmail}`} style={{ color: "#007bff" }}>{companyEmail}</a> : "Not available"}</div>
              </div>
            </div>
          </div>

          {/* Application Tips */}
          <div style={{ border: "2px solid #d4edda", borderRadius: "12px", padding: "24px", backgroundColor: "#f8fff9" }}>
            <h4 style={{ margin: "0 0 16px 0", color: "#28a745", fontSize: "1.3rem", fontWeight: "600" }}>💡 Application Tips</h4>
            <ul style={{ margin: 0, paddingLeft: "20px", lineHeight: "1.6", color: "#555" }}>
              <li>Customize your resume and cover letter for this specific role</li>
              <li>Highlight relevant experience and skills that match the job requirements</li>
              <li>Research the company and mention why you're interested in working there</li>
              <li>Proofread your application before submitting</li>
              <li>Follow up if you haven't heard back within a week</li>
            </ul>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "32px" }}>
          <button
            onClick={onClose}
            style={{
              padding: "12px 24px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "500"
            }}
          >
            Close
          </button>
          <button
            onClick={() => onApply(job.id)}
            style={{
              padding: "12px 24px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            📤 Apply for this Job
          </button>
        </div>
      </div>
    </div>
  );
}

export default JobDetailsModal;