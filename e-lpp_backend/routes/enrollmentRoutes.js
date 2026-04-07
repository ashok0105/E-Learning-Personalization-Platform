const express = require("express");
const router = express.Router();
const {
    enrollCourse,
    getMyCourses,
    updateProgress
} = require("../controllers/enrollmentController");
const auth = require("../middleware/authMiddleware");

// POST /api/enrollment — enroll in a course
router.post("/", auth, enrollCourse);

// GET /api/enrollment/my-courses — get my enrolled courses
router.get("/my-courses", auth, getMyCourses);

// PUT /api/enrollment/progress — update course progress
router.put("/progress", auth, updateProgress);

module.exports = router;
