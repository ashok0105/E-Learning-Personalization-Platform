const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  progress: { type: Number, default: 0 },
  completedAt: { type: Date, default: null },
  quizPassed: { type: Boolean, default: false }
}, { timestamps: true });

// Ensure one enrollment per student per course
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);