const mongoose = require('mongoose');

// ===== VIDEO SUB-SCHEMA =====
const VideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },  // YouTube URL or direct link
  duration: { type: String },                   // e.g. "12:34"
  order: { type: Number, default: 0 },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' }
}, { _id: true });

// ===== NOTE SUB-SCHEMA =====
const NoteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fileUrl: { type: String },    // External link (Google Drive, Dropbox, etc.)
  size: { type: String }        // e.g. "2.4 MB"
}, { _id: true });

// ===== QUIZ QUESTION SUB-SCHEMA =====
const QuizQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],  // Array of 4 option strings
  correctAnswer: { type: Number, required: true } // Index of correct option (0-3)
}, { _id: true });

// ===== COURSE SCHEMA =====
const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  instructorName: { type: String }, // Denormalized for quick access
  category: { type: String, default: 'General' },
  duration: { type: String },
  image: { type: String },
  price: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  students: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },

  // === VIDEOS ARRAY ===
  videos: [VideoSchema],

  // === NOTES ARRAY ===
  notes: [NoteSchema],

  // === QUIZZES ARRAY (embedded in course) ===
  quizzes: [QuizQuestionSchema],

  // === METADATA ===
  tags: [{ type: String }],
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  }

}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);