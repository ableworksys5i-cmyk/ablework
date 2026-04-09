import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/api";

function ApplicantRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    disability_type: "",
    education: "",
    preferred_job: "",
    skills: "",
    location: "",
    latitude: null,
    longitude: null,
    verification_file: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Capture location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("📍 Location captured:", latitude, longitude);
          setForm(prev => ({
            ...prev,
            latitude: latitude,
            longitude: longitude,
            location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          }));
        },
        (error) => {
          console.log("⚠️ Location access denied or error:", error);
          // Continue without location - not blocking registration
        }
      );
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        alert("Please upload a PDF or image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      setForm(prev => ({
        ...prev,
        verification_file: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    if (!form.name || !form.username || !form.email || !form.password || !form.disability_type || !form.education) {
      setError("Please fill in all required fields");
      return;
    }

    if (!form.verification_file) {
      setError("PWD verification document is required");
      return;
    }

    try {
      setLoading(true);
      console.log("Sending registration request...");
      console.log("Form data:", form);

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("username", form.username);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("disability_type", form.disability_type);
      formData.append("education", form.education);
      formData.append("preferred_job", form.preferred_job);
      formData.append("skills", form.skills);
      formData.append("location", form.location);
      if (form.latitude !== null && form.latitude !== undefined) {
        formData.append("latitude", form.latitude);
      }
      if (form.longitude !== null && form.longitude !== undefined) {
        formData.append("longitude", form.longitude);
      }
      formData.append("verification_file", form.verification_file);
      formData.append("role", "applicant");

      console.log("FormData created");

      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        body: formData
      });

      console.log("Response received:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error (${response.status}): ${errorText}`);
      }

      const result = await response.json();

      if (!result.success) {
        setError(result.message || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      // Redirect to email verification page
      navigate(`/verify-email?user_id=${result.user_id}&email=${encodeURIComponent(result.email)}`);
    } catch (error) {
      console.error("Registration error:", error);
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Applicant Registration</h2>
        <p style={styles.subtitle}>Join ABLEWORK and find opportunities tailored for you</p>

        {error && (
          <div style={{...styles.errorContainer, marginBottom: "20px"}}>
            <p style={{margin: "0", color: "#d32f2f", fontWeight: "bold"}}>❌ {error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
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

          <div style={styles.formGroup}>
            <label style={styles.label}>Type of Disability *</label>
            <select
              name="disability_type"
              value={form.disability_type}
              onChange={handleChange}
              style={styles.select}
              required
            >
              <option value="">Select disability type</option>
              <option value="physical">Physical Disability</option>
              <option value="visual">Visual Impairment</option>
              <option value="hearing">Hearing Impairment</option>
              <option value="cognitive">Cognitive Disability</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Education Level *</label>
            <select
              name="education"
              value={form.education}
              onChange={handleChange}
              style={styles.select}
              required
            >
              <option value="">Select education level</option>
              <option value="high_school">High School</option>
              <option value="associate">Associate Degree</option>
              <option value="bachelor">Bachelor's Degree</option>
              <option value="master">Master's Degree</option>
              <option value="phd">PhD</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Preferred Job</label>
            <input
              name="preferred_job"
              placeholder="What type of job are you looking for?"
              value={form.preferred_job}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Skills</label>
            <textarea
              name="skills"
              placeholder="List your skills (optional)"
              value={form.skills}
              onChange={handleChange}
              style={styles.textarea}
              rows="3"
            />
          </div>

          {/* Location Status */}
          <div style={{...styles.formGroup, backgroundColor: "#e8f4f8", padding: "10px", borderRadius: "4px", fontSize: "14px"}}>
            <label style={styles.label}>📍 Location Status</label>
            {form.latitude && form.longitude ? (
              <p style={{margin: "0", color: "#28a745", fontWeight: "bold"}}>✓ Location captured: {form.location}</p>
            ) : (
              <p style={{margin: "0", color: "#ffc107", fontWeight: "bold"}}>⚠️ Please allow location access for better job recommendations</p>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>PWD Verification Document *</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.gif"
              onChange={handleFileChange}
              style={styles.fileInput}
              required
            />
            <small style={styles.fileHelp}>
              Upload a PDF or image of your PWD ID or medical certificate (max 5MB)
            </small>
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
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
    marginBottom: "30px"
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    border: "1px solid #ffcdd2",
    borderRadius: "4px",
    padding: "12px",
    marginBottom: "15px"
  },
  form: {
    display: "flex",
    flexDirection: "column"
  },
  formGroup: {
    marginBottom: "20px"
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontWeight: "bold",
    color: "#333"
  },
  input: {
    width: "100%",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
    boxSizing: "border-box"
  },
  select: {
    width: "100%",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
    boxSizing: "border-box"
  },
  textarea: {
    width: "100%",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
    boxSizing: "border-box",
    resize: "vertical"
  },
  locationMethodContainer: {
    display: "flex",
    gap: "20px",
    marginBottom: "15px"
  },
  radioLabel: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    fontWeight: "normal"
  },
  radio: {
    marginRight: "8px"
  },
  locationGroup: {
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
    padding: "15px",
    backgroundColor: "#fafafa"
  },
  detectButton: {
    padding: "10px 15px",
    backgroundColor: "#2196F3",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.9rem",
    marginBottom: "10px"
  },
  manualLocationGroup: {
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
    padding: "15px",
    backgroundColor: "#fafafa"
  },
  coordInputs: {
    display: "flex",
    gap: "10px",
    marginBottom: "10px"
  },
  coordInput: {
    flex: 1,
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "0.9rem"
  },
  statusMessage: {
    marginTop: "10px",
    fontSize: "0.9rem"
  },
  fileInput: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
    boxSizing: "border-box"
  },
  fileHelp: {
    display: "block",
    marginTop: "5px",
    color: "#666",
    fontSize: "0.8rem"
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