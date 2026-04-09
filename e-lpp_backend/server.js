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

// ✅ CORS FIX (IMPORTANT)
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://e-learning-personalization-platform-17.onrender.com",
  "https://e-learning-personalization-platform-17.onrender.com:443"
];

app.use((err, req, res, next) => {
  console.error("🔥 FULL ERROR:", err);

  res.status(500).json({
    message: err.message,
    stack: err.stack
  });
});

const cors = require("cors");

// ✅ Allow all origins (FOR DEBUG - IMPORTANT)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Handle preflight requests
app.options("*", cors());

// ✅ HANDLE PREFLIGHT (VERY IMPORTANT)
app.options('*', cors());

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

// YouTube API
app.use('/api/youtube',      require('./routes/youtubeRoutes'));

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLERS
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
