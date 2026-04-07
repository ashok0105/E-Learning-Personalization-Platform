const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const QuizResult = require("../models/QuizResult");

// POST /api/enrollment — enroll logged-in student in a course
exports.enrollCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const studentId = req.user.id;

        if (!courseId) {
            return res.status(400).json({ message: "courseId is required" });
        }

        // Check course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Check if already enrolled
        const existing = await Enrollment.findOne({ student: studentId, course: courseId });
        if (existing) {
            return res.status(200).json({ message: "Already enrolled", enrollment: existing });
        }

        // Create enrollment
        const enrollment = await Enrollment.create({
            student: studentId,
            course: courseId,
            progress: 0
        });

        // Increment student count on course
        await Course.findByIdAndUpdate(courseId, { $inc: { students: 1 } });

        res.status(201).json({ message: "Enrolled successfully", enrollment });
    } catch (error) {
        console.error("Enroll error:", error);
        res.status(500).json({ message: "Error enrolling in course" });
    }
};

// GET /api/enrollment/my-courses — get all courses the logged-in user is enrolled in
exports.getMyCourses = async (req, res) => {
    try {
        const studentId = req.user.id;

        const enrollments = await Enrollment.find({ student: studentId })
            .populate({
                path: "course",
                select: "title description duration category image rating students"
            })
            .sort({ createdAt: -1 });

        const myCourses = enrollments.map(e => ({
            enrollmentId: e._id,
            id: e.course?._id,
            _id: e.course?._id,
            title: e.course?.title,
            description: e.course?.description,
            duration: e.course?.duration,
            category: e.course?.category,
            imageUrl: e.course?.image,
            image: e.course?.image,
            rating: e.course?.rating,
            students: e.course?.students,
            progress: e.progress,
            completedAt: e.completedAt,
            quizPassed: e.quizPassed
        }));

        res.json(myCourses);
    } catch (error) {
        console.error("Get my courses error:", error);
        res.status(500).json({ message: "Error fetching your courses" });
    }
};

// PUT /api/enrollment/progress — update progress for an enrolled course
exports.updateProgress = async (req, res) => {
    try {
        const { courseId, progress, completed } = req.body;
        const studentId = req.user.id;

        const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
        if (!enrollment) {
            return res.status(404).json({ message: "Enrollment not found" });
        }

        enrollment.progress = progress;
        if (completed) {
            enrollment.completedAt = new Date();
        }
        await enrollment.save();

        res.json({ message: "Progress updated", enrollment });
    } catch (error) {
        console.error("Update progress error:", error);
        res.status(500).json({ message: "Error updating progress" });
    }
};
