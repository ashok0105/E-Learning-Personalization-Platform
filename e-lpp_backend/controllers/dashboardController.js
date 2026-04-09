const Enrollment = require("../models/Enrollment");
const QuizResult = require("../models/QuizResult");

// GET /api/dashboard/stats
exports.getDashboardStats = async (req, res) => {
    try {
        const studentId = req.user.id;

        // Count enrolled courses
        const enrollments = await Enrollment.find({ student: studentId })
            .populate("course", "title category image");

        const enrolledCount = enrollments.length;

        // Average progress
        const avgProgress = enrollments.length > 0
            ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
            : 0;

        // Count passed quizzes (certificates)
        const certificatesEarned = await QuizResult.countDocuments({
            user: studentId,
            passed: true
        });

        // Recent courses (up to 3)
        const recentCourses = enrollments.slice(0, 3).map(e => ({
            id: e.course?._id,
            title: e.course?.title,
            category: e.course?.category,
            image: e.course?.image,
            progress: e.progress
        }));

        res.json({
            enrolledCount,
            avgProgress,
            certificatesEarned,
            recentCourses
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        res.status(500).json({ message: "Error fetching dashboard stats" });
    }
};
