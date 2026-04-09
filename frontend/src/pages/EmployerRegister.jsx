import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/api";

function EmployerRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    company_name: "",
    company_address: "",
    contact_number: "",
    company_website: "",
    latitude: null,
    longitude: null,
    verification_file: null
  });

  const [locationLoading, setLocationLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Automatically detect location on component mount
    detectLocation();
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      console.log("Geolocation not supported. Using default location.");
      setForm(prev => ({
        ...prev,
        latitude: 0,
        longitude: 0
      }));
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setForm(prev => ({
          ...prev,
          latitude,
          longitude
        }));
        setLocationLoading(false);
      },
      (error) => {
        console.error("Location detection error:", error);
        setForm(prev => ({
          ...prev,
          latitude: 0,
          longitude: 0
        }));
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

const handleChange = (e)=>{
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

  if (!form.company_name || !form.email || !form.username || !form.password || !form.company_address || !form.contact_number) {
    setError("Please fill in all required fields");
    return;
  }

  if (!form.verification_file) {
    setError("Employer verification document is required");
    return;
  }

  try {
    setLoading(true);
    const formData = new FormData();
    formData.append("name", form.name || form.company_name || "Employer");
    formData.append("username", form.username);
    formData.append("email", form.email);
    formData.append("password", form.password);
    formData.append("company_name", form.company_name);
    formData.append("company_address", form.company_address);
    formData.append("contact_number", form.contact_number);
    formData.append("company_website", form.company_website);
    formData.append("latitude", form.latitude);
    formData.append("longitude", form.longitude);
    formData.append("verification_file", form.verification_file);
    formData.append("role", "employer");

    const response = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: formData
    });

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
    console.error("Employer registration error:", error);
    setError("Registration failed. Please try again.");
  } finally {
    setLoading(false);
  }
};

return (
  <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "linear-gradient(135deg, #212121 0%, #0d47a1 100%)", padding: "30px" }}>
    <div style={{ width: "100%", maxWidth: "520px", background: "#fff", borderRadius: "14px", padding: "32px", boxShadow: "0 18px 40px rgba(0,0,0,0.24)" }}>
      <h2 style={{ margin: 0, marginBottom: "12px", color: "#0d47a1" }}>Employer Registration</h2>
      <p style={{ margin: "0 0 24px", color: "#455a64", lineHeight: 1.4 }}>Start hiring inclusive talent with ABLEWORK.</p>

      {error && (
        <div style={{backgroundColor: "#ffebee", border: "1px solid #ffcdd2", borderRadius: "4px", padding: "12px", marginBottom: "20px"}}>
          <p style={{margin: "0", color: "#d32f2f", fontWeight: "bold"}}>❌ {error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <input
          name="company_name"
          placeholder="Company Name"
          onChange={handleChange}
          value={form.company_name}
          style={{ padding: "12px 14px", border: "1px solid #b0bec5", borderRadius: "8px", fontSize: "1rem" }}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          value={form.email}
          style={{ padding: "12px 14px", border: "1px solid #b0bec5", borderRadius: "8px", fontSize: "1rem" }}
          required
        />
        <input
          name="username"
          placeholder="Username"
          onChange={handleChange}
          value={form.username}
          style={{ padding: "12px 14px", border: "1px solid #b0bec5", borderRadius: "8px", fontSize: "1rem" }}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          value={form.password}
          style={{ padding: "12px 14px", border: "1px solid #b0bec5", borderRadius: "8px", fontSize: "1rem" }}
          required
        />
        <input
          name="company_address"
          placeholder="Company Address"
          onChange={handleChange}
          value={form.company_address}
          style={{ padding: "12px 14px", border: "1px solid #b0bec5", borderRadius: "8px", fontSize: "1rem" }}
          required
        />
        <input
          name="company_website"
          placeholder="Company Website"
          onChange={handleChange}
          value={form.company_website}
          style={{ padding: "12px 14px", border: "1px solid #b0bec5", borderRadius: "8px", fontSize: "1rem" }}
        />
        <input
          name="contact_number"
          placeholder="Contact Number"
          onChange={handleChange}
          value={form.contact_number}
          style={{ padding: "12px 14px", border: "1px solid #b0bec5", borderRadius: "8px", fontSize: "1rem" }}
          required
        />

        <label style={{ fontSize: "0.9rem", color: "#455a64" }}>
          Company Verification Document (PDF/JPG/PNG, max 5MB)*
        </label>
        <input
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/gif"
          onChange={handleFileChange}
          style={{ border: "1px solid #b0bec5", borderRadius: "8px", padding: "10px" }}
          required
        />

        <button
          type="submit"
          style={{ padding: "12px", borderRadius: "8px", border: "none", backgroundColor: "#0d47a1", color: "white", fontWeight: "600", fontSize: "1rem", cursor: "pointer", opacity: loading ? 0.6 : 1 }}
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/login")}
          style={{ padding: "10px", borderRadius: "8px", border: "1px solid #0d47a1", backgroundColor: "transparent", color: "#0d47a1", fontSize: "0.9rem", cursor: "pointer" }}
        >
          Already have an account? Login
        </button>
      </form>
    </div>
  </div>
);


}

export default EmployerRegister;