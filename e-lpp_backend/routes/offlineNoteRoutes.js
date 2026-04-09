const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  getMyNotes,
  createNote,
  updateNote,
  deleteNote
} = require("../controllers/offlineNoteController");

// All routes require authentication
router.get("/", auth, getMyNotes);
router.post("/", auth, createNote);
router.put("/:id", auth, updateNote);
router.delete("/:id", auth, deleteNote);

module.exports = router;
