const Course = require("../models/Course");
const User = require("../models/User");

// GET /api/admin/pending — get all pending courses
exports.getPendingCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: "Pending" })
      .populate("instructor", "name email");
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending courses" });
  }
};

// PUT /api/admin/approve/:id
exports.approveCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { status: "Approved" },
      { new: true }
    );
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ message: "Course approved", course });
  } catch (error) {
    res.status(500).json({ message: "Error approving course" });
  }
};

// PUT /api/admin/reject/:id
exports.rejectCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { status: "Rejected" },
      { new: true }
    );
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ message: "Course rejected", course });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting course" });
  }
};

// GET /api/admin/all-courses — all courses regardless of status
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("instructor", "name email")
      .sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching all courses" });
  }
};

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};