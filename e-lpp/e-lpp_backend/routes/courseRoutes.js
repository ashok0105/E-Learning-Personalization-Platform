const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// ─── PUBLIC ROUTES ───────────────────────────────────────────────────────────

// GET /api/courses?category=AI&search=python&level=Beginner
router.get("/", courseController.getApprovedCourses);

// GET /api/courses/:id
router.get("/:id", courseController.getCourseById);

// ─── PROTECTED ROUTES ────────────────────────────────────────────────────────

// POST /api/courses — instructor or admin creates a course
router.post("/", auth, role(["instructor", "admin"]), courseController.createCourse);

// PUT /api/courses/:id — update own course
router.put("/:id", auth, courseController.updateCourse);

// DELETE /api/courses/:id
router.delete("/:id", auth, courseController.deleteCourse);

// POST /api/courses/:id/videos — add video to a course
router.post("/:id/videos", auth, courseController.addVideo);

// DELETE /api/courses/:id/videos/:videoId — remove video
router.delete("/:id/videos/:videoId", auth, courseController.removeVideo);

// POST /api/courses/:id/quizzes — add quiz questions to course
router.post("/:id/quizzes", auth, courseController.addQuizQuestions);

// POST /api/courses/:id/submit-quiz
router.post("/:id/submit-quiz", auth, courseController.submitCourseQuiz);

module.exports = router;
