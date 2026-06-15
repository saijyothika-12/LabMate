const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createExperiment,
  getMyExperiments,
  getExperimentById,
  generateReport,
  updateExperiment,
  deleteExperiment,
} = require("../controllers/experimentController");

router.use(protect);

router.route("/")
  .get(getMyExperiments)
  .post(createExperiment);

router.route("/:id")
  .get(getExperimentById)
  .put(updateExperiment)
  .delete(deleteExperiment);

router.post("/:id/generate-report", generateReport);

module.exports = router;