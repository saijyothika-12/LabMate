const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { generateVivaQuestions, evaluateAnswer } = require("../controllers/vivaController");

router.use(protect);

router.get("/:experimentId/questions", generateVivaQuestions);
router.post("/:experimentId/evaluate", evaluateAnswer);

module.exports = router;