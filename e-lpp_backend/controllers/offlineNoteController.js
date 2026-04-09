const OfflineNote = require("../models/OfflineNote");

// ─────────────────────────────────────────────────────────────────────────
// GET /api/offline-notes — Get all notes for the logged-in user
// ─────────────────────────────────────────────────────────────────────────
exports.getMyNotes = async (req, res) => {
  try {
    const notes = await OfflineNote.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error("Get notes error:", error);
    res.status(500).json({ message: "Error fetching notes" });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// POST /api/offline-notes — Create a new note
// ─────────────────────────────────────────────────────────────────────────
exports.createNote = async (req, res) => {
  try {
    const { title, course, size, fileUrl } = req.body;

    if (!title || !course) {
      return res.status(400).json({ message: "Title and course are required" });
    }

    const note = await OfflineNote.create({
      title,
      course,
      size: size || "0 MB",
      fileUrl: fileUrl || "",
      user: req.user.id
    });

    res.status(201).json({ message: "Note created", note });
  } catch (error) {
    console.error("Create note error:", error);
    res.status(500).json({ message: "Error creating note" });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// PUT /api/offline-notes/:id — Update a note
// ─────────────────────────────────────────────────────────────────────────
exports.updateNote = async (req, res) => {
  try {
    const note = await OfflineNote.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (note.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { title, course, size, fileUrl } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (course !== undefined) updates.course = course;
    if (size !== undefined) updates.size = size;
    if (fileUrl !== undefined) updates.fileUrl = fileUrl;

    const updatedNote = await OfflineNote.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({ message: "Note updated", note: updatedNote });
  } catch (error) {
    console.error("Update note error:", error);
    res.status(500).json({ message: "Error updating note" });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// DELETE /api/offline-notes/:id — Delete a note
// ─────────────────────────────────────────────────────────────────────────
exports.deleteNote = async (req, res) => {
  try {
    const note = await OfflineNote.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (note.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await OfflineNote.findByIdAndDelete(req.params.id);
    res.json({ message: "Note deleted" });
  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({ message: "Error deleting note" });
  }
};
