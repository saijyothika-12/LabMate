const Groq = require("groq-sdk");
const Experiment = require("../models/Experiment");

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const generateVivaQuestions = async (req, res) => {
  try {
    const experiment = await Experiment.findById(req.params.experimentId);
    if (!experiment) return res.status(404).json({ message: "Experiment not found" });

    const prompt = `You are an engineering professor conducting a viva exam.

Experiment: ${experiment.title}
Branch: ${experiment.branch}
${experiment.report?.theory ? `Theory: ${experiment.report.theory}` : ""}

Generate 10 viva questions. Mix: 3 basic, 4 intermediate, 3 advanced.

Return ONLY a valid JSON object with a "questions" array, no extra text:
{
  "questions": [
    {
      "id": 1,
      "question": "What is the aim of this experiment?",
      "difficulty": "basic",
      "modelAnswer": "The aim is to..."
    }
  ]
}`;

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    res.json({ questions: parsed.questions });
  } catch (error) {
    console.error("Viva question error:", error);
    res.status(500).json({ message: "Failed to generate questions" });
  }
};

const evaluateAnswer = async (req, res) => {
  const { question, studentAnswer, modelAnswer } = req.body;
  try {
    const prompt = `You are an engineering professor evaluating a viva answer.

Question: ${question}
Model Answer: ${modelAnswer}
Student Answer: ${studentAnswer}

Return ONLY a valid JSON object with no extra text:
{
  "score": <0 to 10>,
  "feedback": "Specific feedback",
  "missedPoints": ["point 1", "point 2"],
  "isCorrect": <true if score >= 6>
}`;

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const evaluation = JSON.parse(completion.choices[0].message.content);
    res.json(evaluation);
  } catch (error) {
    res.status(500).json({ message: "Failed to evaluate answer" });
  }
};

module.exports = { generateVivaQuestions, evaluateAnswer };