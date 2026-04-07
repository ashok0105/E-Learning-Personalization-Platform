const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true } // index of the correct option
});

const QuizSchema = new mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
    questions: [QuestionSchema],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', QuizSchema);