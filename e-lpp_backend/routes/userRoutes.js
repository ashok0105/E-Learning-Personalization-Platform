const express = require("express");
const router = express.Router();
const { getProfile, updateProfile } = require("../controllers/userController");
const auth = require("../middleware/authMiddleware");

// GET /api/user/profile
router.get("/profile", auth, getProfile);

// PUT /api/user/profile
router.put("/profile", auth, updateProfile);

module.exports = router;
