import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyExperiments, deleteExperiment } from "../services/api";

export default function Dashboard() {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchExperiments = async () => {
      const data = await getMyExperiments();
      setExperiments(data);
      setLoading(false);
    };
    fetchExperiments();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    const confirmed = window.confirm("Are you sure you want to delete this experiment?");
    if (!confirmed) return;
    await deleteExperiment(id);
    setExperiments((prev) => prev.filter((exp) => exp._id !== id));
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1>🧪 LabMate</h1>
          <p>Welcome, {user.name} | {user.branch}</p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button onClick={() => navigate("/experiment/new")}>+ New Experiment</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {loading ? (
        <p>Loading your experiments...</p>
      ) : experiments.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: "4rem" }}>
          <p>No experiments yet. Create your first one!</p>
          <button onClick={() => navigate("/experiment/new")}>+ New Experiment</button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {experiments.map((exp) => (
            <div
              key={exp._id}
              onClick={() => navigate(`/experiment/${exp._id}`)}
              style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1.5rem", cursor: "pointer", position: "relative" }}
            >
              <h3>{exp.title}</h3>
              <p>{exp.branch} · Semester {exp.semester}</p>
              <span>{exp.reportGenerated ? "✅ Report Ready" : "⏳ Report Not Generated"}</span>

              <div
                style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <button
                  onClick={(e) => handleDelete(e, exp._id)}
                  style={{
                    background: "#e74c3c",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "0.4rem 0.8rem",
                    cursor: "pointer",
                  }}
                >
                  🗑️ Delete
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/experiment/${exp._id}/edit`);
                  }}
                  style={{
                    background: "#f59e0b",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "0.4rem 0.8rem",
                    cursor: "pointer",
                  }}
                >
                  ✏️ Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}