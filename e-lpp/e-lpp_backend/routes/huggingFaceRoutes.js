const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/authMiddleware");
const role    = require("../middleware/roleMiddleware");
const hf      = require("../controllers/huggingFaceController");

// All AI routes require a logged-in user
// POST /api/ai/recommend-courses       — student sees personalised rankings
router.post("/recommend-courses",      auth, hf.recommendCourses);

// POST /api/ai/explain-answer          — shown on quiz results screen
router.post("/explain-answer",         auth, hf.explainAnswer);

// POST /api/ai/summarize               — summarise course description / notes
router.post("/summarize",              auth, hf.summarize);

// POST /api/ai/sentiment               — instructor analytics on feedback
router.post("/sentiment",              auth, role(["instructor", "admin"]), hf.sentiment);

// POST /api/ai/generate-quiz-questions — instructor quiz builder helper
router.post("/generate-quiz-questions", auth, role(["instructor", "admin"]), hf.generateQuizQuestions);

module.exports = router;