const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: false }, // null for Google-only accounts
  role:     { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },

  // Google OAuth fields
  googleId: { type: String, sparse: true, unique: true }, // sparse = allow multiple nulls
  avatar:   { type: String }                               // Google profile picture URL
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);