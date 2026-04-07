const User   = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");

// ── Config (change domain / key only here — or move to .env) ────────────────
const INSTRUCTOR_DOMAIN = process.env.INSTRUCTOR_EMAIL_DOMAIN || "elpp.ac.in";
const ADMIN_DOMAIN      = process.env.ADMIN_EMAIL_DOMAIN      || "elpp.ac.in";
const ADMIN_SECRET_KEY  = process.env.ADMIN_SECRET_KEY        || "ELPP@Admin2024";

// ── Helpers ──────────────────────────────────────────────────────────────────
const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

const userPayload = (user) => ({
  id: user._id, name: user.name, email: user.email, role: user.role
});

// ════════════════════════════════════════════════════════════════════════════
// POST /api/auth/signup
//
// Role rules (ALL enforced server-side — never trust the client):
//
//   student    → any valid email  →  no extra requirements
//   instructor → email MUST end @<INSTRUCTOR_DOMAIN>
//   admin      → email MUST end @<ADMIN_DOMAIN>  +  must send correct adminKey
// ════════════════════════════════════════════════════════════════════════════
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, adminKey } = req.body;

    // ── Basic field check ──────────────────────────────────────────────────
    if (!name || !email || !password) {
      return res.status(400).json({ msg: "Please fill all fields" });
    }

    // Normalise email to lowercase
    const normalEmail = email.toLowerCase().trim();
    const emailDomain = normalEmail.split("@")[1];

    // ── Determine which role to assign ────────────────────────────────────
    let assignedRole = "student"; // safe default

    if (role === "instructor") {
      if (!emailDomain || emailDomain !== INSTRUCTOR_DOMAIN.toLowerCase()) {
        return res.status(400).json({
          msg: `Instructor accounts require an official email ending in @${INSTRUCTOR_DOMAIN}. Example: yourname@${INSTRUCTOR_DOMAIN}`
        });
      }
      assignedRole = "instructor";
    }

    if (role === "admin") {
      // 1. Email domain check
      if (!emailDomain || emailDomain !== ADMIN_DOMAIN.toLowerCase()) {
        return res.status(400).json({
          msg: `Admin accounts require an official email ending in @${ADMIN_DOMAIN}. Example: admin@${ADMIN_DOMAIN}`
        });
      }
      // 2. Secret key check
      if (!adminKey || adminKey !== ADMIN_SECRET_KEY) {
        return res.status(403).json({
          msg: "Invalid Admin Secret Key. Contact the system administrator."
        });
      }
      assignedRole = "admin";
    }

    // ── Duplicate check ────────────────────────────────────────────────────
    const existing = await User.findOne({ email: normalEmail });
    if (existing) {
      return res.status(400).json({ msg: "An account with this email already exists." });
    }

    // ── Create user ────────────────────────────────────────────────────────
    const hashed = await bcrypt.hash(password, 10);
    const user   = await User.create({
      name,
      email:    normalEmail,
      password: hashed,
      role:     assignedRole
    });

    res.status(201).json({
      msg:    `${assignedRole.charAt(0).toUpperCase() + assignedRole.slice(1)} account created successfully! Please login.`,
      userId: user._id
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ msg: "Server error during registration" });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// POST /api/auth/login
//
// Re-validates domain rules at login time so old accounts cannot bypass
// the new domain enforcement.
// ════════════════════════════════════════════════════════════════════════════
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalEmail });
    if (!user) return res.status(400).json({ message: "No account found with this email." });

    // Google-only account has no password
    if (!user.password) {
      return res.status(400).json({
        message: "This account uses Google Sign-In. Please log in with Google."
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Incorrect password." });

    // Re-verify domain for instructor and admin at login time
    const emailDomain = user.email.split("@")[1]?.toLowerCase();

    if (user.role === "instructor" && emailDomain !== INSTRUCTOR_DOMAIN.toLowerCase()) {
      return res.status(403).json({
        message: `Instructor login requires an @${INSTRUCTOR_DOMAIN} email.`
      });
    }
    if (user.role === "admin" && emailDomain !== ADMIN_DOMAIN.toLowerCase()) {
      return res.status(403).json({
        message: `Admin login requires an @${ADMIN_DOMAIN} email.`
      });
    }

    res.json({ token: signToken(user), user: userPayload(user) });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// POST /api/auth/google
// Google Sign-In is for STUDENTS only.
// Instructors and admins must use email + password with their official domain.
// ════════════════════════════════════════════════════════════════════════════
exports.googleLogin = async (req, res) => {
  try {
    const { OAuth2Client } = require("google-auth-library");
    const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken:  credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const { sub: googleId, name, email, picture: avatar } = ticket.getPayload();
    const normalEmail = email.toLowerCase().trim();
    const emailDomain = normalEmail.split("@")[1];

    // Block instructor/admin domains from using Google Sign-In
    if (emailDomain === INSTRUCTOR_DOMAIN.toLowerCase() ||
        emailDomain === ADMIN_DOMAIN.toLowerCase()) {
      return res.status(403).json({
        message: `Accounts with @${emailDomain} must log in with email and password, not Google Sign-In.`
      });
    }

    let user = await User.findOne({ $or: [{ googleId }, { email: normalEmail }] });
    if (!user) {
      user = await User.create({ name, email: normalEmail, googleId, avatar, role: "student" });
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.avatar   = avatar;
      await user.save();
    }

    res.json({ token: signToken(user), user: userPayload(user) });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(401).json({ message: "Google authentication failed" });
  }
};