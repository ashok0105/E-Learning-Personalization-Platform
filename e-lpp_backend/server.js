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

// ✅🔥 STRONG CORS FIX (RENDER COMPATIBLE)
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://e-learning-personalization-platform-17.onrender.com"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow Postman / mobile apps
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("❌ CORS Blocked:", origin);
      callback(null, false); // don't crash server
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// ✅ VERY IMPORTANT: Handle preflight requests
app.options("*", cors());

// ✅ EXTRA SAFETY (ensures headers always present)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://e-learning-personalization-platform-17.onrender.com");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// ═══════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════

// Auth
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
  console.error("🔥 ERROR:", err);
  res.status(500).json({ message: err.message || "Internal server error" });
});

// ═══════════════════════════════════════════════════════════════
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
