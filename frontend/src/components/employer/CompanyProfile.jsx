import React from 'react';
import { API_URL } from '../../api/api';

function CompanyProfile({
  employer,
  selectedLogo,
  logoPreview,
  onEditProfile,
  onLogoFileChange,
  onUploadLogo
}) {
  return (
    <div>
      <h2 style={{ fontSize: "2rem", marginBottom: "20px" }}>🏢 Company Profile Management</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
        {/* Company Info */}
        <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#f9f9f9" }}>
          <h3>Company Information</h3>
          <div style={{ display: "grid", gap: "15px" }}>
            <div>
              <label><b>Email:</b></label>
              <p>{employer.email}</p>
            </div>
            <div>
              <label><b>Username:</b></label>
              <p>{employer.username}</p>
            </div>
            <div>
              <label><b>Company Name:</b></label>
              <p>{employer.company_name}</p>
            </div>
            <div>
              <label><b>Address:</b></label>
              <p>{employer.company_address}</p>
            </div>
            <div>
              <label><b>Contact Number:</b></label>
              <p>{employer.contact_number}</p>
            </div>
          </div>
          <button
            onClick={onEditProfile}
            style={{ marginTop: "20px", padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
          >
            ✏️ Edit Profile
          </button>
        </div>

        {/* Logo Upload */}
        <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#fff3e0" }}>
          <h3>🏷️ Company Logo</h3>
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <div style={{
              width: "120px",
              height: "120px",
              border: "2px dashed #ddd",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              backgroundColor: "#f9f9f9",
              overflow: "hidden"
            }}>
              {logoPreview ? (
                <img src={logoPreview} alt="Logo Preview" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "cover" }} />
              ) : employer.logo ? (
                <img src={`${API_URL}/uploads/logos/${employer.logo}`} alt="Company Logo" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "2rem" }}>🏢</span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={onLogoFileChange}
              style={{ marginBottom: "10px" }}
            />
            <br />
            <button
              onClick={onUploadLogo}
              disabled={!selectedLogo}
              style={{
                padding: "8px 16px",
                backgroundColor: selectedLogo ? "#28a745" : "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: selectedLogo ? "pointer" : "not-allowed"
              }}
            >
              📤 Upload Logo
            </button>
            {selectedLogo && (
              <p style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
                Selected: {selectedLogo.name}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyProfile;