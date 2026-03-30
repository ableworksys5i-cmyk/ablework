import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  const styles = {
    page: {
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%)"
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "16px 32px",
      backgroundColor: "#fff",
      boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
      borderBottom: "1px solid #e0e0e0"
    },
    logo: {
      fontSize: "1.5rem",
      fontWeight: "700",
      color: "#0d47a1"
    },
    navButtons: {
      display: "flex",
      gap: "12px"
    },
    navButton: {
      padding: "10px 20px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
      fontSize: "0.95rem",
      fontWeight: "600",
      transition: "all 0.2s"
    },
    loginBtn: {
      backgroundColor: "transparent",
      color: "#0d47a1",
      border: "2px solid #0d47a1"
    },
    registerBtn: {
      backgroundColor: "#0d47a1",
      color: "#fff"
    },
    hero: {
      flex: 1,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "40px 20px"
    },
    card: {
      width: "100%",
      maxWidth: "720px",
      background: "#fff",
      borderRadius: "16px",
      boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
      padding: "48px",
      textAlign: "center",
      border: "1px solid #e0e0e0"
    },
    title: {
      fontSize: "2.5rem",
      marginBottom: "16px",
      fontWeight: "700",
      color: "#0d47a1"
    },
    subtitle: {
      fontSize: "1.1rem",
      marginBottom: "32px",
      color: "#546e7a",
      lineHeight: "1.6"
    },
    features: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "24px",
      marginTop: "32px",
      paddingTop: "32px",
      borderTop: "1px solid #e0e0e0"
    },
    feature: {
      textAlign: "center"
    },
    featureIcon: {
      fontSize: "2.5rem",
      marginBottom: "12px"
    },
    featureTitle: {
      fontWeight: "600",
      color: "#0d47a1",
      marginBottom: "8px"
    },
    featureText: {
      fontSize: "0.9rem",
      color: "#78909c"
    }
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>🏢 ABLEWORK</div>
        <div style={styles.navButtons}>
          <button 
            style={{ ...styles.navButton, ...styles.loginBtn }}
            onClick={() => navigate("/login")}
          >
            Sign In
          </button>
          <button 
            style={{ ...styles.navButton, ...styles.registerBtn }}
            onClick={() => navigate("/chooserole")}
          >
            Create Account
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.card}>
          <h1 style={styles.title}>Welcome to ABLEWORK</h1>
          <p style={styles.subtitle}>
            Connecting employers with talented persons with disabilities. 
            Create inclusive opportunities and build a diverse workforce.
          </p>

          <div style={styles.features}>
            <div style={styles.feature}>
              <div style={styles.featureIcon}>👥</div>
              <div style={styles.featureTitle}>For Applicants</div>
              <div style={styles.featureText}>Find jobs tailored to your abilities and preferences</div>
            </div>
            <div style={styles.feature}>
              <div style={styles.featureIcon}>🏢</div>
              <div style={styles.featureTitle}>For Employers</div>
              <div style={styles.featureText}>Discover inclusive talent for your organization</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;