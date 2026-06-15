import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createExperiment, generateReport, getExperiment, updateExperiment } from "../services/api";

export default function NewExperiment() {
  const navigate = useNavigate();
  const { id } = useParams();           // if present, we're editing
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", branch: "EEE", semester: "", studentNotes: "" });
  const [readings, setReadings] = useState([{ sr: 1, observation: "", result: "" }]);

  // If editing, load the existing experiment and pre-fill the form
  useEffect(() => {
    if (!isEditing) return;
    const load = async () => {
      const data = await getExperiment(id);
      setForm({
        title: data.title || "",
        branch: data.branch || "EEE",
        semester: data.semester || "",
        studentNotes: data.studentNotes || "",
      });

      // Readings may come back as an array OR as a JSON string — handle both
      let loadedReadings = data.readings;
      if (typeof loadedReadings === "string") {
        try {
          loadedReadings = JSON.parse(loadedReadings);
        } catch {
          loadedReadings = [];
        }
      }
      if (Array.isArray(loadedReadings) && loadedReadings.length > 0) {
        setReadings(loadedReadings);
      }
    };
    load();
  }, [id, isEditing]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleReadingChange = (index, field, value) => {
    const updated = [...readings];
    updated[index][field] = value;
    setReadings(updated);
  };

  const addRow = () => {
    setReadings([...readings, { sr: readings.length + 1, observation: "", result: "" }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        await updateExperiment(id, { ...form, readings });
        await generateReport(id);
        navigate(`/experiment/${id}`);
      } else {
        const created = await createExperiment({ ...form, readings });
        if (created._id) {
          await generateReport(created._id);
          navigate(`/experiment/${created._id}`);
        }
      }
    } catch (err) {
      alert("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "2rem" }}>
      <button onClick={() => navigate("/dashboard")}>← Back</button>
      <h2>{isEditing ? "Edit Experiment" : "New Experiment"}</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label>Experiment Title *</label>
          <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Verification of Thevenin's Theorem" required style={{ width: "100%", padding: "0.5rem" }} />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Branch *</label>
          <select name="branch" value={form.branch} onChange={handleChange} style={{ width: "100%", padding: "0.5rem" }}>
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
          <input name="semester" type="number" min="1" max="8" value={form.semester} onChange={handleChange} style={{ width: "100%", padding: "0.5rem" }} />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Your Notes / Observations</label>
          <textarea name="studentNotes" value={form.studentNotes} onChange={handleChange} rows={4} placeholder="Write what you observed, any specific readings..." style={{ width: "100%", padding: "0.5rem" }} />
        </div>
        <div style={{ marginBottom: "1.5rem" }}>
          <label>Readings Table</label>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "0.5rem" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ddd", padding: "0.5rem" }}>Sr.</th>
                <th style={{ border: "1px solid #ddd", padding: "0.5rem" }}>Observation</th>
                <th style={{ border: "1px solid #ddd", padding: "0.5rem" }}>Result</th>
              </tr>
            </thead>
            <tbody>
              {readings.map((row, i) => (
                <tr key={i}>
                  <td style={{ border: "1px solid #ddd", padding: "0.5rem", textAlign: "center" }}>{row.sr}</td>
                  <td style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
                    <input value={row.observation} onChange={(e) => handleReadingChange(i, "observation", e.target.value)} style={{ width: "100%" }} placeholder="e.g. R1 = 100Ω" />
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
                    <input value={row.result} onChange={(e) => handleReadingChange(i, "result", e.target.value)} style={{ width: "100%" }} placeholder="e.g. Vth = 5V" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" onClick={addRow} style={{ marginTop: "0.5rem" }}>+ Add Row</button>
        </div>
        <button type="submit" disabled={loading} style={{ padding: "0.75rem 2rem", width: "100%" }}>
          {loading ? "⏳ Generating Report with AI..." : isEditing ? "Update & Regenerate Report →" : "Generate Lab Report →"}
        </button>
      </form>
    </div>
  );
}