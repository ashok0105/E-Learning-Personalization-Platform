const express    = require('express');
const dotenv     = require('dotenv');
const cors       = require('cors');
const connectDB  = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════════
app.use(express.json({ limit: "10mb" }));
app.use(cors({
  // Read from .env so this works in production too
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true
}));

// ═══════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════

// Auth (email/password + Google)
app.use('/api/auth',         require('./routes/authRoutes'));
app.use('/api/user',         require('./routes/userRoutes'));

// Core platform
app.use('/api/courses',      require('./routes/courseRoutes'));
app.use('/api/enrollment',   require('./routes/enrollmentRoutes'));
app.use('/api/dashboard',    require('./routes/dashboardRoutes'));
app.use('/api/quiz',         require('./routes/quizRoutes'));
app.use('/api/progress',     require('./routes/progressRoutes'));
app.use('/api/admin',        require('./routes/adminRoutes'));
app.use('/api/offline-notes',require('./routes/offlineNoteRoutes'));



// ── YouTube Data API ──────────────────────────────────────────
// Kept: instructors use it to search/embed videos
app.use('/api/youtube',      require('./routes/youtubeRoutes'));

// ══════════════════════════════════════════════════════════════
// REMOVED APIs (see notes below)
// ══════════════════════════════════════════════════════════════
//
// ✂️  REMOVED: /api/generate-quiz  (Quizgecko)
//     Reason: paid API, overlaps with HuggingFace /api/ai/generate-quiz-questions
//             which is free.  Delete quizgeckoController.js & generateQuizRoutes.js
//
// ✂️  REMOVED: /api/quizapi  (QuizAPI.io)
//     Reason: the free tier is very limited (50 req/day) and the instructor
//             quiz builder already lets instructors create questions manually.
//             HuggingFace generate-quiz-questions covers the AI-generation use-case.
//             Delete quizApiController.js & quizApiRoutes.js
//
// ══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// GLOBAL ERROR HANDLERS
// ═══════════════════════════════════════════════════════════════
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

// ═══════════════════════════════════════════════════════════════
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
