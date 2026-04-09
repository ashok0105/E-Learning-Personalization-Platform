const express = require("express");
const router = express.Router();
const { searchVideos, getVideoDetails } = require("../controllers/youtubeController");
const auth = require("../middleware/authMiddleware");

// GET /api/youtube/search?query=python
// Public: search YouTube videos
router.get("/search", searchVideos);

// GET /api/youtube/video/:videoId
// Get single video details
router.get("/video/:videoId", getVideoDetails);

module.exports = router;
