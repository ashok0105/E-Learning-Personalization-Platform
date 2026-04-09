const Course = require("../models/Course");
const User = require("../models/User");

// ─────────────────────────────────────────────────────────────────────────
// POST /api/courses — Create a new course (instructor/admin only)
// ─────────────────────────────────────────────────────────────────────────
exports.createCourse = async (req, res) => {
  try {
    const { title, description, category, duration, image, price, level, tags, videos, notes, quizzes, quizQuestions } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    // Get instructor name for denormalized field
    const instructorUser = await User.findById(req.user.id).select("name");

    // Instructor sends quizQuestions, schema field is quizzes — map appropriately
    const quizData = quizzes || quizQuestions || [];

    const course = await Course.create({
      title,
      description,
      instructor: req.user.id,
      instructorName: instructorUser?.name || "Instructor",
      category: category || "General",
      duration,
      image,
      price: price || 0,
      level: level || "Beginner",
      tags: tags || [],
      videos: videos || [],
      notes: notes || [],
      quizzes: quizData,
      status: req.user.role === "admin" ? "Approved" : "Pending"
    });

    res.status(201).json({ message: "Course created successfully", course });
  } catch (error) {
    console.error("Create course error:", error);
    res.status(500).json({ message: "Error creating course", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// GET /api/courses — Get all approved courses (public)
// ─────────────────────────────────────────────────────────────────────────
exports.getApprovedCourses = async (req, res) => {
  try {
    const { category, search, level } = req.query;

    const filter = { status: "Approved" };
    if (category && category !== "All") filter.category = category;
    if (level) filter.level = level;
    if (search) filter.title = { $regex: search, $options: "i" };

    const courses = await Course.find(filter)
      .populate("instructor", "name email")
      .sort({ createdAt: -1 })
      .select("-quizzes"); // Don't expose quiz answers in listing

    const mapped = courses.map(c => ({
      id: c._id,
      _id: c._id,
      title: c.title,
      description: c.description,
      category: c.category,
      duration: c.duration,
      image: c.image,
      price: c.price,
      rating: c.rating,
      students: c.students,
      level: c.level,
      tags: c.tags,
      instructor: c.instructor,
      instructorName: c.instructorName,
      videoCount: c.videos.length,
      status: c.status,
      createdAt: c.createdAt
    }));

    res.json(mapped);
  } catch (error) {
    console.error("Get courses error:", error);
    res.status(500).json({ message: "Error fetching courses" });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// GET /api/courses/:id — Get single course by ID (public)
// ─────────────────────────────────────────────────────────────────────────
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name email");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Return full course data (with videos, but strip quiz correct answers)
    const sanitizedQuizzes = course.quizzes.map(q => ({
      _id: q._id,
      question: q.question,
      options: q.options
      // correctAnswer is intentionally omitted for students
    }));

    res.json({
      id: course._id,
      _id: course._id,
      title: course.title,
      description: course.description,
      category: course.category,
      duration: course.duration,
      image: course.image,
      price: course.price,
      rating: course.rating,
      students: course.students,
      level: course.level,
      tags: course.tags,
      instructor: course.instructor,
      instructorName: course.instructorName,
      videos: course.videos,
      notes: course.notes || [],
      quizzes: sanitizedQuizzes,
      status: course.status
    });
  } catch (error) {
    console.error("Get course by ID error:", error);
    res.status(500).json({ message: "Error fetching course" });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// PUT /api/courses/:id — Update course (instructor who owns it / admin)
// ─────────────────────────────────────────────────────────────────────────
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Only the course instructor or an admin can update
    if (
      course.instructor.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized to update this course" });
    }

    const allowedUpdates = [
      "title", "description", "category", "duration", "image",
      "price", "level", "tags", "videos", "notes", "quizzes", "status"
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate("instructor", "name");

    res.json({ message: "Course updated successfully", course: updatedCourse });
  } catch (error) {
    console.error("Update course error:", error);
    res.status(500).json({ message: "Error updating course", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// DELETE /api/courses/:id — Delete course (admin only)
// ─────────────────────────────────────────────────────────────────────────
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (
      course.instructor.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized to delete this course" });
    }

    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({ message: "Error deleting course" });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// POST /api/courses/:id/videos — Add a video to a course
// ─────────────────────────────────────────────────────────────────────────
exports.addVideo = async (req, res) => {
  try {
    const { title, videoUrl, duration, order } = req.body;

    if (!title || !videoUrl) {
      return res.status(400).json({ message: "Video title and URL are required" });
    }

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.instructor.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    course.videos.push({ title, videoUrl, duration, order: order || course.videos.length });
    await course.save();

    res.status(201).json({ message: "Video added", videos: course.videos });
  } catch (error) {
    console.error("Add video error:", error);
    res.status(500).json({ message: "Error adding video" });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// DELETE /api/courses/:id/videos/:videoId — Remove a video
// ─────────────────────────────────────────────────────────────────────────
exports.removeVideo = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.instructor.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    course.videos = course.videos.filter(
      v => v._id.toString() !== req.params.videoId
    );
    await course.save();

    res.json({ message: "Video removed", videos: course.videos });
  } catch (error) {
    res.status(500).json({ message: "Error removing video" });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// POST /api/courses/:id/quizzes — Add quiz questions to a course
// ─────────────────────────────────────────────────────────────────────────
exports.addQuizQuestions = async (req, res) => {
  try {
    const { questions } = req.body; // Array of { question, options, correctAnswer }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Provide an array of questions" });
    }

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.instructor.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    questions.forEach(q => {
      if (!q.question || !q.options || q.correctAnswer === undefined) return;
      course.quizzes.push(q);
    });

    await course.save();
    res.status(201).json({ message: "Quiz questions added", count: course.quizzes.length });
  } catch (error) {
    res.status(500).json({ message: "Error adding quiz questions" });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// POST /api/courses/:id/submit-quiz — Submit quiz answers and get score
// ─────────────────────────────────────────────────────────────────────────
exports.submitCourseQuiz = async (req, res) => {
  try {
    const { answers } = req.body; // { questionId: selectedIndex }

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    let correct = 0;
    const results = [];

    course.quizzes.forEach(q => {
      const userAnswer = answers[q._id.toString()];
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) correct++;
      results.push({
        question: q.question,
        yourAnswer: q.options[userAnswer] || "Not answered",
        correctAnswer: q.options[q.correctAnswer],
        isCorrect
      });
    });

    const total = course.quizzes.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    const passed = percentage >= 60;

    res.json({
      message: "Quiz submitted",
      score: correct,
      total,
      percentage,
      passed,
      results,
      certificate: passed ? `Certificate earned for: ${course.title}` : null
    });
  } catch (error) {
    res.status(500).json({ message: "Error submitting quiz" });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// GET /api/courses/all — Admin: get ALL courses regardless of status
// ─────────────────────────────────────────────────────────────────────────
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