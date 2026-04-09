import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user_id, setUser_id] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.message || "Failed to request password reset");
        return;
      }

      setSuccess(result.message);
      setUser_id(result.user_id || null);

      if (result.user_id) {
        // Redirect to verify code page after 2 seconds
        setTimeout(() => {
          navigate(`/verify-reset-code?user_id=${result.user_id}`);
        }, 2000);
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setError("Failed to request password reset. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Forgot Password</h2>
        <p style={styles.subtitle}>Enter your email to receive a password reset code</p>

        {error && (
          <div style={{...styles.errorContainer, marginBottom: "20px"}}>
            <p style={{margin: "0", color: "#d32f2f", fontWeight: "bold"}}>❌ {error}</p>
          </div>
        )}

        {success && (
          <div style={{...styles.successContainer, marginBottom: "20px"}}>
            <p style={{margin: "0", color: "#28a745", fontWeight: "bold"}}>✅ {success}</p>
            <p style={{margin: "10px 0 0", fontSize: "0.9rem", color: "#28a745"}}>Redirecting to verification...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address *</label>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Sending..." : "Send Reset Code"}
          </button>
        </form>

        <div style={styles.footer}>
          <p>Remember your password? <span style={styles.link} onClick={() => navigate("/login")}>Login here</span></p>
        </div>
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
    maxWidth: "450px",
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
    padding: "12px"
  },
  successContainer: {
    backgroundColor: "#e8f5e9",
    border: "1px solid #c8e6c9",
    borderRadius: "4px",
    padding: "12px"
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
  button: {
    padding: "14px",
    backgroundColor: "#2196F3",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px",
    transition: "background-color 0.2s"
  },
  footer: {
    marginTop: "20px",
    textAlign: "center",
    fontSize: "0.9rem",
    color: "#666"
  },
  link: {
    color: "#2196F3",
    cursor: "pointer",
    fontWeight: "bold",
    textDecoration: "none"
  }
};

export default ForgotPassword;
