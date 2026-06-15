const Groq = require("groq-sdk");
const Experiment = require("../models/Experiment");

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const createExperiment = async (req, res) => {
  const { title, branch, semester, studentNotes, readings } = req.body;
  try {
    const experiment = await Experiment.create({
      user: req.user._id,
      title, branch, semester, studentNotes, readings,
    });
    res.status(201).json(experiment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyExperiments = async (req, res) => {
  try {
    const experiments = await Experiment.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(experiments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getExperimentById = async (req, res) => {
  try {
    const experiment = await Experiment.findById(req.params.id);
    if (!experiment) return res.status(404).json({ message: "Experiment not found" });
    if (experiment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    res.json(experiment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateReport = async (req, res) => {
  try {
    const experiment = await Experiment.findById(req.params.id);
    if (!experiment) return res.status(404).json({ message: "Experiment not found" });

    const prompt = `You are an expert engineering lab report writer.
Generate a complete lab report for an engineering student.

Experiment Details:
- Title: ${experiment.title}
- Branch: ${experiment.branch}
- Semester: ${experiment.semester}
- Student Notes: ${experiment.studentNotes || "None provided"}
- Readings: ${JSON.stringify(experiment.readings) || "None provided"}

Return ONLY a valid JSON object with no extra text:
{
  "aim": "Clear aim of the experiment",
  "theory": "Detailed theoretical background including all relevant formulas and equations",
  "apparatus": ["item 1", "item 2", "item 3"],
  "procedure": ["step 1", "step 2", "step 3"],
  "observations": [{"sr": 1, "observation": "value", "result": "value"}],
  "calculations": [
    {
      "description": "Name of what is being calculated",
      "formula": "The formula used e.g. R = V/I",
      "substitution": "Actual values substituted e.g. R = 5V / 0.05A",
      "result": "Final calculated answer e.g. R = 100 Ω"
    }
  ],
  "result": "Clear conclusion of the experiment",
  "precautions": ["precaution 1", "precaution 2", "precaution 3"]
}`;

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const report = JSON.parse(completion.choices[0].message.content);
    experiment.report = report;
    experiment.reportGenerated = true;
    await experiment.save();
    res.json(experiment);
  } catch (error) {
    console.error("Report generation error:", error);
    res.status(500).json({ message: "Failed to generate report" });
  }
};

const updateExperiment = async (req, res) => {
  try {
    const experiment = await Experiment.findById(req.params.id);
    if (!experiment) return res.status(404).json({ message: "Experiment not found" });
    if (experiment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const { title, branch, semester, studentNotes, readings } = req.body;
    if (title !== undefined) experiment.title = title;
    if (branch !== undefined) experiment.branch = branch;
    if (semester !== undefined) experiment.semester = semester;
    if (studentNotes !== undefined) experiment.studentNotes = studentNotes;
    if (readings !== undefined) experiment.readings = readings;
    await experiment.save();
    res.json(experiment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteExperiment = async (req, res) => {
  try {
    const experiment = await Experiment.findById(req.params.id);
    if (!experiment) return res.status(404).json({ message: "Experiment not found" });
    if (experiment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    await experiment.deleteOne();
    res.json({ message: "Experiment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createExperiment, getMyExperiments, getExperimentById, generateReport, updateExperiment, deleteExperiment };