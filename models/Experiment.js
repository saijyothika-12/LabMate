const mongoose = require("mongoose");

const experimentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    branch: { type: String, required: true },
    semester: Number,
    studentNotes: { type: String, default: "" },
    readings: [mongoose.Schema.Types.Mixed],
    report: {
      aim: { type: mongoose.Schema.Types.Mixed },
      theory: { type: mongoose.Schema.Types.Mixed },
      apparatus: { type: mongoose.Schema.Types.Mixed },
      procedure: { type: mongoose.Schema.Types.Mixed },
      observations: { type: mongoose.Schema.Types.Mixed },
      calculations: { type: mongoose.Schema.Types.Mixed },
      result: { type: mongoose.Schema.Types.Mixed },
      precautions: { type: mongoose.Schema.Types.Mixed },
    },
    reportGenerated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Experiment", experimentSchema);