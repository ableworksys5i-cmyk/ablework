import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../api/api";

function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.username || !form.password) {
      alert("Please enter both username and password");
      return;
    }

    try {
      const result = await loginUser(form);

      if (result.success) {
        setUser(result);
        if (result.role === "applicant") {
          navigate("/applicant-dashboard");
        } else if (result.role === "employer") {
          navigate("/employer-dashboard");
        }
      } else {
        alert(result.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please try again.");
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg, #e3f2fd 0%, #90caf9 100%)",
      padding: "20px"
    },
    card: {
      width: "100%",
      maxWidth: "420px",
      background: "#fff",
      borderRadius: "12px",
      boxShadow: "0 12px 35px rgba(0,0,0,0.15)",
      padding: "28px",
      border: "1px solid #e0e0e0"
    },
    title: {
      fontSize: "1.9rem",
      margin: "0 0 10px 0",
      textAlign: "center",
      color: "#0d47a1"
    },
    input: {
      width: "100%",
      padding: "12px",
      marginBottom: "15px",
      border: "1px solid #cfd8dc",
      borderRadius: "8px",
      fontSize: "1rem"
    },
    button: {
      width: "100%",
      padding: "12px",
      backgroundColor: "#1e88e5",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      fontSize: "1.05rem",
      cursor: "pointer"
    },
    linkSection: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "15px",
      fontSize: "0.95rem"
    },
    link: {
      color: "#1e88e5",
      cursor: "pointer",
      textDecoration: "underline"
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Sign In</h2>
        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />
          <input
            style={styles.input}
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button style={styles.button} type="submit">Login</button>
        </form>

        <div style={styles.linkSection}>
          <span style={styles.link} onClick={() => navigate("/chooserole")}>Create account</span>
          <span style={styles.link} onClick={() => alert("Feature coming soon")}>Forgot password?</span>
        </div>
      </div>
    </div>
  );
}

export default Login;