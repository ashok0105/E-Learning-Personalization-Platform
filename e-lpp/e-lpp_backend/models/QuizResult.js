const mongoose = require("mongoose");

const QuizResultSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    percentage: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("QuizResult", QuizResultSchema);
