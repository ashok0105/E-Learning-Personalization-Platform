const mongoose = require("mongoose");

const CertificateSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    quizResult: { type: mongoose.Schema.Types.ObjectId, ref: "QuizResult" },
    percentage: { type: Number, required: true },
    issuedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Certificate", CertificateSchema);
