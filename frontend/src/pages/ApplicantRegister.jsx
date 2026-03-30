import { useState, useEffect } from "react";
import { registerUser } from "../api/api";

function ApplicantRegister() {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    disability_type: "",
    education: "",
    skills: "",
    location: "",
    latitude: null,
    longitude: null,
    pwd_verification_file: null
  });

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Auto-detect location on component mount
  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setForm(prev => ({
          ...prev,
          latitude,
          longitude,
          location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        }));
        setLocationError("");
        setLocationLoading(false);
      },
      (error) => {
        console.error("Location error:", error);
        setLocationError("Please enable location or enter manually");
        setLocationLoading(false);
      }
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (PDF, images only)
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        alert("Please upload a PDF or image file");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      setForm(prev => ({
        ...prev,
        pwd_verification_file: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!form.name || !form.username || !form.email || !form.password || !form.disability_type || !form.education) {
      alert("Please fill in all required fields");
      return;
    }

    if (!form.pwd_verification_file) {
      alert("PWD Verification document is required");
      return;
    }

    setLoading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("username", form.username);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("disability_type", form.disability_type);
      formData.append("education", form.education);
      formData.append("skills", form.skills);
      formData.append("location", form.location);
      formData.append("latitude", form.latitude);
      formData.append("longitude", form.longitude);
      formData.append("pwd_verification_file", form.pwd_verification_file);
      formData.append("role", "applicant");

      // Upload via fetch with FormData
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        body: formData
      });

      const result = await response.json();
      alert(result.message);

      if (result.success) {
        // Reset form
        setForm({
          name: "",
          username: "",
          email: "",
          password: "",
          disability_type: "",
          education: "",
          skills: "",
          location: "",
          latitude: null,
          longitude: null,
          pwd_verification_file: null
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Applicant Registration</h2>
        <p style={styles.subtitle}>Join ABLEWORK and find opportunities tailored for you</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Full Name */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name *</label>
            <input
              name="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          {/* Email */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Email *</label>
            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          {/* Username */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Username *</label>
            <input
              name="username"
              placeholder="Choose a unique username"
              value={form.username}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          {/* Password */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Password *</label>
            <input
              name="password"
              type="password"
              placeholder="Create a strong password"
              value={form.password}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          {/* Disability Type */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Type of Disability *</label>
            <select name="disability_type" value={form.disability_type} onChange={handleChange} style={styles.input} required>
              <option value="">Select Disability Type</option>
              <option value="visual">Visual Impairment</option>
              <option value="hearing">Hearing Impairment</option>
              <option value="mobility">Mobility Disability</option>
              <option value="speech">Speech Disability</option>
              <option value="learning">Learning Disability</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Education */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Education Level *</label>
            <select name="education" value={form.education} onChange={handleChange} style={styles.input} required>
              <option value="">Select Education Level</option>
              <option value="High School">High School</option>
              <option value="Senior High School">Senior High School</option>
              <option value="Vocational">Vocational</option>
              <option value="College Undergraduate">College Undergraduate</option>
              <option value="College Graduate">College Graduate</option>
              <option value="Graduate School">Graduate School</option>
            </select>
          </div>

          {/* Skills (Optional) */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Basic Skills (Optional)</label>
            <input
              name="skills"
              placeholder="e.g., Data Entry, Customer Service, Programming"
              value={form.skills}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          {/* Location */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              📍 Location
              {locationLoading && " (Detecting...)"}
              {locationError && <span style={{ color: "#d32f2f" }}> - {locationError}</span>}
            </label>
            <div style={styles.locationInputGroup}>
              <input
                name="location"
                placeholder="Auto-detected or enter manually"
                value={form.location}
                onChange={handleChange}
                style={{ ...styles.input, flex: 1 }}
              />
              <button
                type="button"
                onClick={detectLocation}
                style={styles.locationButton}
                disabled={locationLoading}
              >
                {locationLoading ? "Detecting..." : "📍"}
              </button>
            </div>
          </div>

          {/* PWD Verification Upload */}
          <div style={styles.formGroup}>
            <label style={styles.label}>PWD Verification Document ✅ *</label>
            <p style={styles.hint}>Upload a PDF or image (PNG, JPG) proving your disability status. Max 5MB.</p>
            <div style={styles.fileUploadArea}>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.gif"
                onChange={handleFileChange}
                style={styles.fileInput}
              />
              <p style={styles.fileName}>
                {form.pwd_verification_file ? `✓ ${form.pwd_verification_file.name}` : "No file selected"}
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    padding: "20px"
  },
  card: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    padding: "40px",
    maxWidth: "500px",
    width: "100%"
  },
  heading: {
    fontSize: "2rem",
    marginBottom: "10px",
    color: "#333",
    textAlign: "center"
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: "30px",
    fontSize: "0.95rem"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  label: {
    fontWeight: "bold",
    color: "#333",
    fontSize: "0.95rem"
  },
  input: {
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
    fontFamily: "Arial, sans-serif",
    transition: "border-color 0.2s"
  },
  hint: {
    fontSize: "0.85rem",
    color: "#666",
    margin: "0"
  },
  locationInputGroup: {
    display: "flex",
    gap: "10px",
    alignItems: "center"
  },
  locationButton: {
    padding: "12px 16px",
    backgroundColor: "#2196F3",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold"
  },
  fileUploadArea: {
    border: "2px dashed #ddd",
    borderRadius: "4px",
    padding: "20px",
    textAlign: "center",
    backgroundColor: "#f9f9f9"
  },
  fileInput: {
    width: "100%",
    padding: "10px",
    cursor: "pointer"
  },
  fileName: {
    marginTop: "10px",
    color: "#4CAF50",
    fontWeight: "bold",
    fontSize: "0.9rem"
  },
  button: {
    padding: "14px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px",
    transition: "background-color 0.2s"
  }
};

export default ApplicantRegister;