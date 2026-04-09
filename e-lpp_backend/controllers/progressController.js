const Enrollment = require("../models/Enrollment");
const Certificate = require("../models/Certificate");
const QuizResult = require("../models/QuizResult");
const Course = require("../models/Course");

// ─────────────────────────────────────────────────────────────────────────
// GET /api/progress/my-progress
// Returns all enrollments with progress for the logged-in student
// ─────────────────────────────────────────────────────────────────────────
exports.getMyProgress = async (req, res) => {
    try {
        const studentId = req.user.id;

        const enrollments = await Enrollment.find({ student: studentId })
            .populate("course", "title description category image duration level")
            .sort({ updatedAt: -1 });

        const progressData = enrollments.map(e => ({
            enrollmentId: e._id,
            courseId: e.course?._id,
            courseTitle: e.course?.title,
            courseThumbnail: e.course?.image,
            category: e.course?.category,
            level: e.course?.level,
            progress: e.progress,
            completedAt: e.completedAt,
            quizPassed: e.quizPassed,
            enrolledAt: e.createdAt
        }));

        // Aggregate stats
        const totalEnrolled = progressData.length;
        const completed = progressData.filter(p => p.completedAt).length;
        const avgProgress = totalEnrolled > 0
            ? Math.round(progressData.reduce((sum, p) => sum + p.progress, 0) / totalEnrolled)
            : 0;

        res.json({
            totalEnrolled,
            completed,
            inProgress: totalEnrolled - completed,
            avgProgress,
            courses: progressData
        });
    } catch (error) {
        console.error("Get progress error:", error);
        res.status(500).json({ message: "Error fetching progress" });
    }
};

// ─────────────────────────────────────────────────────────────────────────
// PUT /api/progress/update
// Update the progress for a specific enrolled course
// Body: { courseId, progress (0-100), completed (boolean) }
// ─────────────────────────────────────────────────────────────────────────
exports.updateProgress = async (req, res) => {
    try {
        const { courseId, progress, completed } = req.body;
        const studentId = req.user.id;

        if (!courseId) return res.status(400).json({ message: "courseId is required" });

        const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
        if (!enrollment) {
            return res.status(404).json({ message: "You are not enrolled in this course" });
        }

        // Validate progress range
        enrollment.progress = Math.min(100, Math.max(0, progress || enrollment.progress));

        if (completed || enrollment.progress === 100) {
            enrollment.completedAt = enrollment.completedAt || new Date();
        }

        await enrollment.save();

        res.json({
            message: "Progress updated",
            courseId,
            progress: enrollment.progress,
            completedAt: enrollment.completedAt
        });
    } catch (error) {
        console.error("Update progress error:", error);
        res.status(500).json({ message: "Error updating progress" });
    }
};

// ─────────────────────────────────────────────────────────────────────────
// GET /api/progress/certificates
// Get all certificates earned by the logged-in student
// ─────────────────────────────────────────────────────────────────────────
exports.getMyCertificates = async (req, res) => {
    try {
        const studentId = req.user.id;

        const certificates = await Certificate.find({ user: studentId })
            .populate("course", "title description category image")
            .populate("quizResult", "percentage score totalQuestions")
            .sort({ issuedAt: -1 });

        const formatted = certificates.map(cert => ({
            certificateId: cert._id,
            courseId: cert.course?._id,
            courseTitle: cert.course?.title,
            courseThumbnail: cert.course?.image,
            category: cert.course?.category,
            percentage: cert.percentage,
            score: cert.quizResult?.score,
            totalQuestions: cert.quizResult?.totalQuestions,
            issuedAt: cert.issuedAt
        }));

        res.json({
            totalCertificates: formatted.length,
            certificates: formatted
        });
    } catch (error) {
        console.error("Get certificates error:", error);
        res.status(500).json({ message: "Error fetching certificates" });
    }
};

// ─────────────────────────────────────────────────────────────────────────
// POST /api/progress/generate-certificate
// Issue a certificate after passing quiz
// Body: { courseId }
// ─────────────────────────────────────────────────────────────────────────
exports.generateCertificate = async (req, res) => {
    try {
        const { courseId } = req.body;
        const studentId = req.user.id;

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found" });

        // Check student passed quiz for this course
        const quizResult = await QuizResult.findOne({
            user: studentId,
            course: courseId,
            passed: true
        }).sort({ submittedAt: -1 });

        if (!quizResult) {
            return res.status(403).json({
                message: "You must pass the quiz (≥60%) before earning a certificate"
            });
        }

        // Check if certificate already exists
        const existing = await Certificate.findOne({ user: studentId, course: courseId });
        if (existing) {
            const cert = await Certificate.findById(existing._id)
                .populate("course", "title");
            return res.json({
                message: "Certificate already issued",
                certificate: existing,
                alreadyIssued: true
            });
        }

        // Create certificate
        const certificate = await Certificate.create({
            user: studentId,
            course: courseId,
            quizResult: quizResult._id,
            percentage: quizResult.percentage
        });

        // Mark enrollment as quiz passed
        await Enrollment.findOneAndUpdate(
            { student: studentId, course: courseId },
            { quizPassed: true, completedAt: new Date(), progress: 100 }
        );

        const populatedCert = await Certificate.findById(certificate._id)
            .populate("course", "title category")
            .populate("user", "name email");

        res.status(201).json({
            message: "🎓 Certificate issued successfully!",
            certificate: {
                id: populatedCert._id,
                studentName: populatedCert.user?.name,
                studentEmail: populatedCert.user?.email,
                courseTitle: populatedCert.course?.title,
                category: populatedCert.course?.category,
                percentage: populatedCert.percentage,
                issuedAt: populatedCert.issuedAt
            }
        });
    } catch (error) {
        console.error("Generate certificate error:", error);
        res.status(500).json({ message: "Error generating certificate" });
    }
};
