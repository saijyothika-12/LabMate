import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getVivaQuestions, evaluateAnswer } from "../services/api";

export default function VivaMode() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [vivaComplete, setVivaComplete] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      const data = await getVivaQuestions(id);
      setQuestions(data.questions || []);
      setLoading(false);
    };
    fetchQuestions();
  }, [id]);

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;
    setEvaluating(true);
    const currentQ = questions[currentIndex];
    const result = await evaluateAnswer(id, {
      question: currentQ.question,
      studentAnswer: answer,
      modelAnswer: currentQ.modelAnswer,
    });
    setEvaluation(result);
    setScores([...scores, result.score]);
    setEvaluating(false);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setVivaComplete(true);
    } else {
      setCurrentIndex(currentIndex + 1);
      setAnswer("");
      setEvaluation(null);
    }
  };

  const totalScore = scores.reduce((a, b) => a + b, 0);
  const maxScore = scores.length * 10;
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  if (loading) return <div style={{ padding: "2rem" }}>⏳ Generating viva questions...</div>;

  if (vivaComplete) {
    return (
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem", textAlign: "center" }}>
        <h2>🎓 Viva Complete!</h2>
        <h1 style={{ fontSize: "4rem" }}>{percentage}%</h1>
        <p>You scored {totalScore} out of {maxScore}</p>
        <p>{percentage >= 80 ? "🌟 Excellent! You're well prepared." : percentage >= 60 ? "👍 Good. Review the questions you missed." : "📖 Needs more preparation."}</p>
        <div style={{ textAlign: "left", marginTop: "2rem" }}>
          {questions.slice(0, scores.length).map((q, i) => (
            <div key={i} style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}>
              <strong>Q{i + 1}:</strong> {q.question}
              <span style={{ float: "right", color: scores[i] >= 6 ? "green" : "red" }}>{scores[i]}/10</span>
            </div>
          ))}
        </div>
        <button onClick={() => navigate(`/experiment/${id}`)} style={{ marginTop: "2rem" }}>Back to Experiment</button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "2rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        <p>Question {currentIndex + 1} of {questions.length} · <strong>{currentQ.difficulty}</strong></p>
        <div style={{ background: "#eee", borderRadius: "4px", height: "8px" }}>
          <div style={{ width: `${((currentIndex + 1) / questions.length) * 100}%`, background: "#4f46e5", height: "100%", borderRadius: "4px", transition: "width 0.3s" }} />
        </div>
      </div>

      <div style={{ background: "#f8f8f8", padding: "1.5rem", borderRadius: "8px", marginBottom: "1.5rem" }}>
        <h3>🎓 Professor asks:</h3>
        <p style={{ fontSize: "1.1rem" }}>{currentQ.question}</p>
      </div>

      {!evaluation && (
        <>
          <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type your answer here..." rows={5} style={{ width: "100%", padding: "0.75rem", fontSize: "1rem" }} />
          <button onClick={handleSubmitAnswer} disabled={evaluating || !answer.trim()} style={{ marginTop: "1rem", padding: "0.75rem 2rem" }}>
            {evaluating ? "⏳ Evaluating..." : "Submit Answer"}
          </button>
        </>
      )}

      {evaluation && (
        <div style={{ marginTop: "1.5rem" }}>
          <div style={{ padding: "1.5rem", background: evaluation.isCorrect ? "#f0fdf4" : "#fef2f2", borderRadius: "8px", borderLeft: `4px solid ${evaluation.isCorrect ? "#16a34a" : "#dc2626"}` }}>
            <h3>Score: {evaluation.score}/10 {evaluation.isCorrect ? "✅" : "❌"}</h3>
            <p><strong>Feedback:</strong> {evaluation.feedback}</p>
            {evaluation.missedPoints?.length > 0 && (
              <>
                <p><strong>What you missed:</strong></p>
                <ul>{evaluation.missedPoints.map((point, i) => <li key={i}>{point}</li>)}</ul>
              </>
            )}
            <p><strong>Model Answer:</strong> {currentQ.modelAnswer}</p>
          </div>
          <button onClick={handleNext} style={{ marginTop: "1rem", padding: "0.75rem 2rem" }}>
            {currentIndex + 1 >= questions.length ? "Finish Viva →" : "Next Question →"}
          </button>
        </div>
      )}
    </div>
  );
}