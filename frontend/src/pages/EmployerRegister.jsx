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
    latitude: "",
    longitude: ""
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setForm((prev) => ({
            ...prev,
            latitude: latitude.toFixed(4),
            longitude: longitude.toFixed(4)
          }));
        },
        () => {}
      );
    }
  }, []);

const handleChange = (e)=>{
setForm({
...form,
[e.target.name]:e.target.value
});
};

const detectLocation = () => {
  // Keep function for potential future use, but not used in UI
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setForm({
          ...form,
          latitude: latitude.toFixed(4),
          longitude: longitude.toFixed(4)
        });
      },
      (error) => {
        console.log("Location detection failed:", error);
      }
    );
  }
};

const handleSubmit = async (e)=>{
e.preventDefault();

const result = await registerUser({
...form,
role:"employer",
name: form.name || form.company_name || "Employer"
});

alert(result.message);

};

return (
  <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "linear-gradient(135deg, #212121 0%, #0d47a1 100%)", padding: "30px" }}>
    <div style={{ width: "100%", maxWidth: "520px", background: "#fff", borderRadius: "14px", padding: "32px", boxShadow: "0 18px 40px rgba(0,0,0,0.24)" }}>
      <h2 style={{ margin: 0, marginBottom: "12px", color: "#0d47a1" }}>Employer Registration</h2>
      <p style={{ margin: "0 0 24px", color: "#455a64", lineHeight: 1.4 }}>Start hiring inclusive talent with ABLEWORK.</p>

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
          name="contact_number"
          placeholder="Contact Number"
          onChange={handleChange}
          value={form.contact_number}
          style={{ padding: "12px 14px", border: "1px solid #b0bec5", borderRadius: "8px", fontSize: "1rem" }}
          required
        />

        <button
          type="submit"
          style={{ padding: "12px", borderRadius: "8px", border: "none", backgroundColor: "#0d47a1", color: "white", fontWeight: "600", fontSize: "1rem", cursor: "pointer" }}
        >
          Register
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