import React from 'react';
import './Profile.css';

function Profile({ user, onUpdateProfile, onUploadResume }) {
  return (
    <div className="profile-root">
      <h2>👤 My Profile</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
        {/* Personal Information */}
        <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#f9f9f9" }}>
          <h3>📋 Personal Information</h3>
          <div style={{ display: "grid", gap: "15px", marginTop: "15px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Full Name</label>
              <input
                type="text"
                value={user.name}
                onChange={e => onUpdateProfile("name", e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Email</label>
              <input
                type="email"
                value={user.email}
                onChange={e => onUpdateProfile("email", e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Phone</label>
              <input
                type="tel"
                value={user.phone}
                onChange={e => onUpdateProfile("phone", e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Location</label>
              <input
                type="text"
                value={user.location}
                onChange={e => onUpdateProfile("location", e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
                placeholder="City, State/Country"
              />
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#f9f9f9" }}>
          <h3>💼 Professional Information</h3>
          <div style={{ display: "grid", gap: "15px", marginTop: "15px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Current Position</label>
              <input
                type="text"
                value={user.currentPosition}
                onChange={e => onUpdateProfile("currentPosition", e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
                placeholder="e.g., Software Developer"
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Years of Experience</label>
              <select
                value={user.experience}
                onChange={e => onUpdateProfile("experience", e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
              >
                <option value="">Select experience</option>
                <option value="0-1">0-1 years</option>
                <option value="1-3">1-3 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5-10">5-10 years</option>
                <option value="10+">10+ years</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Education</label>
              <input
                type="text"
                value={user.education}
                onChange={e => onUpdateProfile("education", e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
                placeholder="e.g., Bachelor's in Computer Science"
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>LinkedIn Profile</label>
              <input
                type="url"
                value={user.linkedin}
                onChange={e => onUpdateProfile("linkedin", e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#f9f9f9", marginTop: "20px" }}>
        <h3>🛠️ Skills</h3>
        <div style={{ marginTop: "15px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "15px" }}>
            {user.skills.map((skill, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: "#007bff",
                  color: "white",
                  padding: "5px 12px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px"
                }}
              >
                {skill}
                <button
                  onClick={() => {
                    const newSkills = user.skills.filter((_, i) => i !== index);
                    onUpdateProfile("skills", newSkills);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "16px",
                    lineHeight: 1
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              placeholder="Add a skill"
              id="newSkill"
              style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
            />
            <button
              onClick={() => {
                const newSkill = document.getElementById('newSkill').value.trim();
                if (newSkill && !user.skills.includes(newSkill)) {
                  onUpdateProfile("skills", [...user.skills, newSkill]);
                  document.getElementById('newSkill').value = '';
                }
              }}
              style={{ padding: "10px 20px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
            >
              Add Skill
            </button>
          </div>
        </div>
      </div>

      {/* Resume Upload */}
      <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#f9f9f9", marginTop: "20px" }}>
        <h3>📄 Resume/CV</h3>
        <div style={{ marginTop: "15px" }}>
          {user.resume ? (
            <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "15px" }}>
              <span>📎 {user.resume.name}</span>
              <button
                style={{ padding: "5px 10px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
              >
                View
              </button>
              <button
                style={{ padding: "5px 10px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
              >
                Remove
              </button>
            </div>
          ) : (
            <p style={{ margin: "0 0 15px 0", color: "#666" }}>No resume uploaded yet.</p>
          )}
          <div>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={onUploadResume}
              style={{ marginBottom: "10px" }}
            />
            <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
              Supported formats: PDF, DOC, DOCX. Max size: 5MB
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <button
          style={{ padding: "15px 30px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px", fontWeight: "bold" }}
        >
          💾 Save Profile
        </button>
      </div>
    </div>
  );
}

export default Profile;