const express = require("express");
const router = express.Router();
const {
    getMyProgress,
    updateProgress,
    getMyCertificates,
    generateCertificate
} = require("../controllers/progressController");
const auth = require("../middleware/authMiddleware");

// GET /api/progress/my-progress
router.get("/my-progress", auth, getMyProgress);

// PUT /api/progress/update
router.put("/update", auth, updateProgress);

// GET /api/progress/certificates
router.get("/certificates", auth, getMyCertificates);

// POST /api/progress/generate-certificate
router.post("/generate-certificate", auth, generateCertificate);

module.exports = router;
