import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getExperiment } from "../services/api";

export default function ExperimentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [experiment, setExperiment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperiment = async () => {
      const data = await getExperiment(id);
      setExperiment(data);
      setLoading(false);
    };
    fetchExperiment();
  }, [id]);

  if (loading) return <div style={{ padding: "2rem" }}>⏳ Loading experiment...</div>;
  if (!experiment) return <div style={{ padding: "2rem" }}>Experiment not found!</div>;

  const { report } = experiment;

  const formatHeader = (k) => {
    if (k === "sr") return "S.No";
    return k.charAt(0).toUpperCase() + k.slice(1);
  };

  const capitalize = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const codeStyle = {
    background: "#f0f0f0",
    padding: "0.1rem 0.4rem",
    borderRadius: "4px",
    fontFamily: "monospace",
    fontSize: "0.95rem",
  };

  // Description → Formula → Substitution → Result → rest
  const renderCalcItem = (item, i) => {
    if (typeof item !== "object") return <p key={i}>{String(item)}</p>;
    const knownKeys = ["description", "formula", "substitution", "result"];
    const remaining = Object.keys(item).filter(k => !knownKeys.includes(k));
    return (
      <div key={i} style={{ marginBottom: "0.75rem", padding: "0.75rem", background: "#fff", borderRadius: "6px", border: "1px solid #e0e0e0" }}>
        {item.description && (
          <p style={{ marginBottom: "0.4rem" }}>
            <strong>Description:</strong> {capitalize(item.description)}
          </p>
        )}
        {item.formula && (
          <p style={{ marginBottom: "0.4rem" }}>
            <strong>Formula:</strong> <code style={codeStyle}>{item.formula}</code>
          </p>
        )}
        {item.substitution && (
          <p style={{ marginBottom: "0.4rem" }}>
            <strong>Substitution:</strong> <code style={codeStyle}>{item.substitution}</code>
          </p>
        )}
        {item.result && (
          <p style={{ marginBottom: "0.4rem" }}>
            <strong>Result:</strong> <code style={{ ...codeStyle, background: "#e8f5e9", color: "#2e7d32" }}>{item.result}</code>
          </p>
        )}
        {remaining.map(k => (
          <p key={k} style={{ marginBottom: "0.4rem" }}>
            <strong>{formatHeader(k)}:</strong> {capitalize(String(item[k]))}
          </p>
        ))}
      </div>
    );
  };

  const renderCalculations = (value) => {
    if (!value) return "—";
    if (typeof value === "string") return <p style={{ whiteSpace: "pre-wrap" }}>{value}</p>;
    if (Array.isArray(value)) return value.map((item, i) => renderCalcItem(item, i));
    if (typeof value === "object") return renderCalcItem(value, 0);
    return String(value);
  };

  const renderObservations = (value) => {
    if (!value) return "—";
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object") {
      const keys = Object.keys(value[0]);
      return (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "0.5rem" }}>
          <thead>
            <tr>
              {keys.map((k) => (
                <th key={k} style={{ border: "1px solid #ddd", padding: "0.5rem", background: "#f0f0f0", textAlign: "left" }}>
                  {formatHeader(k)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {value.map((row, i) => (
              <tr key={i}>
                {keys.map((k) => (
                  <td key={k} style={{ border: "1px solid #ddd", padding: "0.5rem" }}>{String(row[k])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    return renderValue(value);
  };

  const renderValue = (value) => {
    if (!value) return "—";
    if (typeof value === "string") return value;
    if (Array.isArray(value)) {
      return (
        <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
          {value.map((item, i) => (
            <li key={i}>{typeof item === "object" ? JSON.stringify(item) : item}</li>
          ))}
        </ul>
      );
    }
    if (typeof value === "object") {
      return (
        <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
          {Object.entries(value).map(([k, v]) => (
            <li key={k}><strong>{formatHeader(k)}:</strong> {String(v)}</li>
          ))}
        </ul>
      );
    }
    return String(value);
  };

  const handleDownloadPDF = () => {
    const printWindow = window.open("", "_blank");

    const obsRows = Array.isArray(report?.observations) && report.observations.length > 0 && typeof report.observations[0] === "object"
      ? `<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%">
          <thead><tr>${Object.keys(report.observations[0]).map(k => `<th style="background:#f0f0f0">${formatHeader(k)}</th>`).join("")}</tr></thead>
          <tbody>${report.observations.map(row => `<tr>${Object.values(row).map(v => `<td>${v}</td>`).join("")}</tr>`).join("")}</tbody>
         </table>`
      : `<p>${Array.isArray(report?.observations) ? report.observations.join(", ") : report?.observations || "—"}</p>`;

    const calcText = () => {
      const c = report?.calculations;
      if (!c) return "<p>—</p>";
      const renderOne = (item) => {
        if (typeof item !== "object") return `<p>${item}</p>`;
        const parts = [];
        if (item.description) parts.push(`<p><strong>Description:</strong> ${capitalize(item.description)}</p>`);
        if (item.formula) parts.push(`<p><strong>Formula:</strong> <code style="background:#f0f0f0;padding:2px 6px">${item.formula}</code></p>`);
        if (item.substitution) parts.push(`<p><strong>Substitution:</strong> <code style="background:#f0f0f0;padding:2px 6px">${item.substitution}</code></p>`);
        if (item.result) parts.push(`<p><strong>Result:</strong> <code style="background:#e8f5e9;padding:2px 6px">${item.result}</code></p>`);
        Object.entries(item)
          .filter(([k]) => !["description","formula","substitution","result"].includes(k))
          .forEach(([k, v]) => parts.push(`<p><strong>${formatHeader(k)}:</strong> ${capitalize(String(v))}</p>`));
        return `<div style="margin-bottom:0.75rem;padding:0.5rem;border:1px solid #ddd;border-radius:4px">${parts.join("")}</div>`;
      };
      if (typeof c === "string") return `<p>${c}</p>`;
      if (Array.isArray(c)) return c.map(renderOne).join("");
      if (typeof c === "object") return renderOne(c);
      return `<p>${c}</p>`;
    };

    const toText = (val) => {
      if (!val) return "—";
      if (typeof val === "string") return val;
      if (Array.isArray(val)) return val.map(i => typeof i === "object" ? Object.values(i).join(", ") : i).join("\n");
      if (typeof val === "object") return Object.entries(val).map(([k, v]) => `${k}: ${v}`).join("\n");
      return String(val);
    };

    printWindow.document.write(`
      <html>
        <head>
          <title>${experiment.title} - Lab Report</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; color: #000; }
            h1 { font-size: 1.5rem; border-bottom: 2px solid #000; padding-bottom: 0.5rem; }
            h2 { font-size: 1.1rem; margin-top: 1.5rem; border-bottom: 1px solid #ccc; padding-bottom: 0.3rem; }
            p { line-height: 1.6; margin: 0.3rem 0; }
            ul { padding-left: 1.5rem; }
            li { margin-bottom: 0.3rem; }
            table { border-collapse: collapse; width: 100%; margin-top: 0.5rem; }
            th, td { border: 1px solid #999; padding: 6px 10px; }
            th { background: #f0f0f0; }
            code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
            .meta { color: #555; margin-bottom: 1.5rem; }
          </style>
        </head>
        <body>
          <h1>${experiment.title}</h1>
          <p class="meta">${experiment.branch} | Semester ${experiment.semester}</p>
          <h2>Aim</h2><p>${toText(report?.aim)}</p>
          <h2>Theory</h2><p style="white-space:pre-wrap">${toText(report?.theory)}</p>
          <h2>Apparatus</h2>
          <ul>${Array.isArray(report?.apparatus) ? report.apparatus.map(i => `<li>${i}</li>`).join("") : `<li>${toText(report?.apparatus)}</li>`}</ul>
          <h2>Procedure</h2>
          <ul>${Array.isArray(report?.procedure) ? report.procedure.map(i => `<li>${i}</li>`).join("") : `<li>${toText(report?.procedure)}</li>`}</ul>
          <h2>Observations</h2>${obsRows}
          <h2>Calculations</h2>${calcText()}
          <h2>Result</h2><p>${toText(report?.result)}</p>
          <h2>Precautions</h2>
          <ul>${Array.isArray(report?.precautions) ? report.precautions.map(i => `<li>${i}</li>`).join("") : `<li>${toText(report?.precautions)}</li>`}</ul>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <button onClick={() => navigate("/dashboard")}>← Back</button>
        <div style={{ display: "flex", gap: "1rem" }}>
          {report && (
            <button
              onClick={handleDownloadPDF}
              style={{ background: "#16a34a", color: "white", padding: "0.75rem 1.5rem", border: "none", borderRadius: "8px", cursor: "pointer" }}
            >
              📥 Download PDF
            </button>
          )}
          <button
            onClick={() => navigate(`/experiment/${id}/edit`)}
            style={{ background: "#f59e0b", color: "white", padding: "0.75rem 1.5rem", border: "none", borderRadius: "8px", cursor: "pointer" }}
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => navigate(`/experiment/${id}/viva`)}
            style={{ background: "#4f46e5", color: "white", padding: "0.75rem 1.5rem", border: "none", borderRadius: "8px", cursor: "pointer" }}
          >
            🎓 Start Viva Prep
          </button>
        </div>
      </div>

      <h2>{experiment.title}</h2>
      <p>{experiment.branch} · Semester {experiment.semester}</p>

      {!report ? (
        <p>⏳ Report not generated yet.</p>
      ) : (
        <div>
          {[
            { label: "🎯 Aim", value: report.aim, render: renderValue },
            { label: "📚 Theory", value: report.theory, render: renderValue },
            { label: "🔧 Apparatus", value: report.apparatus, render: renderValue },
            { label: "📋 Procedure", value: report.procedure, render: renderValue },
            { label: "📊 Observations", value: report.observations, render: renderObservations },
            { label: "🧮 Calculations", value: report.calculations, render: renderCalculations },
            { label: "✅ Result", value: report.result, render: renderValue },
            { label: "⚠️ Precautions", value: report.precautions, render: renderValue },
          ].map((section) => (
            <div key={section.label} style={{ marginBottom: "1.5rem", padding: "1rem", background: "#f9f9f9", borderRadius: "8px" }}>
              <h3 style={{ marginBottom: "0.5rem" }}>{section.label}</h3>
              <div>{section.render(section.value)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}