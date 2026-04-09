const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controllers/dashboardController");
const auth = require("../middleware/authMiddleware");

// GET /api/dashboard/stats
router.get("/stats", auth, getDashboardStats);

module.exports = router;
