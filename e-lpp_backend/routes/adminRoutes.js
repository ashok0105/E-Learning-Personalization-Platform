const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const {
  getPendingCourses,
  approveCourse,
  rejectCourse,
  getAllCourses,
  getAllUsers
} = require("../controllers/adminController");

// All routes require auth + admin role
router.get("/pending", auth, role(["admin"]), getPendingCourses);
router.put("/approve/:id", auth, role(["admin"]), approveCourse);
router.put("/reject/:id", auth, role(["admin"]), rejectCourse);
router.get("/all-courses", auth, role(["admin"]), getAllCourses);
router.get("/users", auth, role(["admin"]), getAllUsers);

module.exports = router;