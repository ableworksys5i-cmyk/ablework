import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function VerifyResetCode() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user_id = searchParams.get("user_id");

  const [resetCode, setResetCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [codeVerified, setCodeVerified] = useState(false);

  useEffect(() => {
    if (!user_id) {
      setError("User ID is missing. Please start from the forgot password page.");
    }
  }, [user_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!resetCode) {
      setError("Please enter the reset code");
      return;
    }

    if (resetCode.length !== 6) {
      setError("Reset code must be 6 digits");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/api/auth/verify-reset-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          user_id: parseInt(user_id),
          reset_code: resetCode 
        })
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.message || "Invalid or expired reset code");
        return;
      }

      setCodeVerified(true);
      setTimeout(() => {
        navigate(`/reset-password?user_id=${user_id}&reset_code=${resetCode}`);
      }, 1500);
    } catch (error) {
      console.error("Verification error:", error);
      setError("Failed to verify code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user_id) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{...styles.errorContainer}}>
            <p style={{margin: "0", color: "#d32f2f", fontWeight: "bold"}}>❌ Error: User ID is missing</p>
            <button 
              onClick={() => navigate("/forgot-password")}
              style={{...styles.button, marginTop: "15px"}}
            >
              Go Back to Forgot Password
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (codeVerified) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{...styles.successContainer}}>
            <p style={{margin: "0", color: "#28a745", fontWeight: "bold"}}>✅ Code verified successfully!</p>
            <p style={{margin: "10px 0 0", fontSize: "0.9rem", color: "#28a745"}}>Redirecting to reset password...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Verify Reset Code</h2>
        <p style={styles.subtitle}>Enter the 6-digit code sent to your email</p>

        {error && (
          <div style={{...styles.errorContainer, marginBottom: "20px"}}>
            <p style={{margin: "0", color: "#d32f2f", fontWeight: "bold"}}>❌ {error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Reset Code *</label>
            <input
              type="text"
              placeholder="Enter 6-digit code"
              maxLength="6"
              value={resetCode}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setResetCode(value);
                if (error) setError("");
              }}
              style={styles.input}
              required
            />
            <small style={styles.help}>Check your email for the code (expires in 15 minutes)</small>
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>

        <div style={styles.footer}>
          <p>Didn't receive the code? <span style={styles.link} onClick={() => navigate("/forgot-password")}>Request a new one</span></p>
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
    fontSize: "2rem",
    letterSpacing: "10px",
    boxSizing: "border-box",
    textAlign: "center",
    fontWeight: "bold"
  },
  help: {
    display: "block",
    marginTop: "5px",
    color: "#999",
    fontSize: "0.8rem"
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

export default VerifyResetCode;
