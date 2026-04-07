const mongoose = require('mongoose');

const OfflineNoteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  course: { type: String, required: true },
  size: { type: String, default: '0 MB' },
  fileUrl: { type: String },           // URL or path to the PDF/file
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('OfflineNote', OfflineNoteSchema);
