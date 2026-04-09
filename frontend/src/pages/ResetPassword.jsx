import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user_id = searchParams.get("user_id");
  const reset_code = searchParams.get("reset_code");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (!user_id || !reset_code) {
      setError("Invalid reset link. Please request a new password reset.");
    }
  }, [user_id, reset_code]);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setNewPassword(password);
    calculatePasswordStrength(password);
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: parseInt(user_id),
          reset_code: reset_code,
          new_password: newPassword
        })
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.message || "Failed to reset password");
        return;
      }

      setSuccess(result.message);
      setError("");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      return;
    } catch (error) {
      console.error("Reset password error:", error);
      setError("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user_id || !reset_code) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{...styles.errorContainer}}>
            <p style={{margin: "0", color: "#d32f2f", fontWeight: "bold"}}>❌ {error}</p>
            <button 
              onClick={() => navigate("/forgot-password")}
              style={{...styles.button, marginTop: "15px"}}
            >
              Request Password Reset
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{...styles.successContainer}}>
            <p style={{margin: "0", color: "#28a745", fontWeight: "bold"}}>✅ {success}</p>
            <p style={{margin: "10px 0 0", fontSize: "0.9rem", color: "#28a745"}}>Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return "#f44336";
    if (passwordStrength <= 2) return "#ff9800";
    if (passwordStrength <= 3) return "#ffc107";
    return "#4caf50";
  };

  const getStrengthText = () => {
    if (passwordStrength <= 1) return "Weak";
    if (passwordStrength <= 2) return "Fair";
    if (passwordStrength <= 3) return "Good";
    return "Strong";
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Reset Password</h2>
        <p style={styles.subtitle}>Create a new password for your account</p>

        {error && (
          <div style={{...styles.errorContainer, marginBottom: "20px"}}>
            <p style={{margin: "0", color: "#d32f2f", fontWeight: "bold"}}>❌ {error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>New Password *</label>
            <div style={styles.passwordInputWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={handlePasswordChange}
                style={styles.input}
                required
              />
              <span 
                style={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>
            {newPassword && (
              <div style={styles.strengthContainer}>
                <div style={{...styles.strengthBar, backgroundColor: getStrengthColor(), width: `${(passwordStrength / 5) * 100}%`}}></div>
                <small style={{color: getStrengthColor(), fontWeight: "bold"}}>
                  Strength: {getStrengthText()}
                </small>
              </div>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm Password *</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError("");
              }}
              style={styles.input}
              required
            />
            {confirmPassword && newPassword === confirmPassword && (
              <small style={{color: "#4caf50", fontWeight: "bold"}}>✅ Passwords match</small>
            )}
            {confirmPassword && newPassword !== confirmPassword && (
              <small style={{color: "#f44336", fontWeight: "bold"}}>❌ Passwords do not match</small>
            )}
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
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
  passwordInputWrapper: {
    position: "relative",
    display: "flex"
  },
  input: {
    width: "100%",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
    boxSizing: "border-box"
  },
  togglePassword: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    color: "#2196F3",
    fontSize: "0.85rem",
    fontWeight: "bold"
  },
  strengthContainer: {
    marginTop: "8px"
  },
  strengthBar: {
    height: "6px",
    borderRadius: "3px",
    marginBottom: "5px",
    transition: "width 0.3s ease"
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

export default ResetPassword;
