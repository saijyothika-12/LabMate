import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/api";
export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", branch: "EEE", semester: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const data = await registerUser(form);
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      navigate("/dashboard");
    } else {
      setError(data.message || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "400px", margin: "60px auto", padding: "2rem", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h2>🧪 Create Account</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label>Name</label>
          <input name="name" value={form.name} onChange={handleChange} required style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }} />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }} />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }} />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Branch</label>
          <select name="branch" value={form.branch} onChange={handleChange} style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}>
            <option>EEE</option>
            <option>CS</option>
            <option>IT</option>
            <option>Electronics</option>
            <option>Mechanical</option>
            <option>Civil</option>
          </select>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Semester</label>
          <input name="semester" type="number" min="1" max="8" value={form.semester} onChange={handleChange} style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }} />
        </div>
        <button type="submit" disabled={loading} style={{ width: "100%", padding: "0.75rem" }}>
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
      <p style={{ marginTop: "1rem", textAlign: "center" }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}