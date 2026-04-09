// ProfilePage.js — fixed
// Removed useAuth() (AuthContext is not wrapped around the app).
// Reads user from localStorage directly, same pattern as Navbar/Sidebar/Dashboard.

import { useEffect, useState } from "react";
import "../styles/profile.css";

const BASE_URL = "https://e-learning-personalization-platform-8.onrender.com";

export default function ProfilePage() {
  // ── Read user from localStorage (same pattern as Navbar.js) ──────────────
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const [formData, setFormData] = useState({ name: "", email: "" });
  const [certificates, setCertificates] = useState([]);
  const [stats, setStats] = useState({
    currentStreak: 0,
    completedCourses: 0,
    avgScore: 0
  });

  // ── Sync form when user loads ─────────────────────────────────────────────
  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || "", email: user.email || "" });
    }
  }, [user]);

  // ── Re-read user if auth-change fires (login / logout elsewhere) ──────────
  useEffect(() => {
    const reload = () => {
      try {
        const u = JSON.parse(localStorage.getItem("user")) || null;
        setUser(u);
      } catch {
        setUser(null);
      }
    };
    window.addEventListener("auth-change", reload);
    return () => window.removeEventListener("auth-change", reload);
  }, []);

  // ── Load real stats from backend ──────────────────────────────────────────
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Quiz history from localStorage for streak
        const quizHistory = JSON.parse(localStorage.getItem("quizHistory")) || [];
        const passed = quizHistory.filter(q => q.score >= 60);
        const avgScore = quizHistory.length > 0
          ? Math.round(quizHistory.reduce((a, q) => a + q.score, 0) / quizHistory.length)
          : 0;

        // Current streak calculation
        const uniqueDates = [...new Set(
          passed.map(q => new Date(q.date).toDateString())
        )].map(d => new Date(d)).sort((a, b) => b - a);

        let streak = 0;
        const today = new Date();
        let check = new Date(today);
        for (const d of uniqueDates) {
          const diff = Math.floor((check - d) / 86400000);
          if (diff === 0 || diff === 1) { streak++; check = new Date(d); check.setDate(check.getDate() - 1); }
          else break;
        }

        // Completed courses from enrollment API
        const res = await fetch(`${BASE_URL}/api/enrollment/my-courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const courses = res.ok ? await res.json() : [];
        const completed = courses.filter(c => c.progress >= 100 || c.completedAt || c.quizPassed).length;

        setStats({ currentStreak: streak, completedCourses: completed, avgScore });
      } catch (err) {
        console.error("Stats fetch error:", err);
      }
    };
    fetchStats();
  }, []);

  // ── Load certificates from API ────────────────────────────────────────────
  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${BASE_URL}/api/progress/certificates`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCertificates(data.certificates || []);
        }
      } catch (err) {
        console.error("Certificate fetch error:", err);
      }
    };
    fetchCerts();
  }, []);

  // ── Handle form input ─────────────────────────────────────────────────────
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ── Save profile changes ──────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: formData.name, email: formData.email })
      });

      if (res.ok) {
        const updatedUser = { ...user, name: formData.name, email: formData.email };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        window.dispatchEvent(new Event("auth-change")); // update Navbar name
        alert("Profile updated successfully!");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Server error. Please try again.");
    }
  };

  // ── Guard: not logged in ──────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="container my-5 text-center">
        <p className="text-muted">Please log in to view your profile.</p>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="container my-5 profile-page">
      <div className="mb-4 text-center">
        <h1 className="fw-bold">My Profile</h1>
        <p className="text-muted">Manage your account settings and learning journey</p>
      </div>

      {/* ── Profile card ── */}
      <div className="card shadow-sm mb-4 profile-card">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-3 text-center">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="avatar"
                  className="rounded-circle mb-3"
                  style={{ width: 90, height: 90, objectFit: "cover" }}
                />
              ) : (
                <div className="profile-avatar mx-auto mb-3">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <span className="badge bg-primary px-3 py-2">{user.role}</span>
            </div>
            <div className="col-md-9">
              <h4 className="fw-bold">{user.name}</h4>
              <p className="text-muted mb-0">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit form ── */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white">
          <h5 className="mb-0">Edit Profile</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control custom-input"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control custom-input"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>
          <button className="btn btn-primary mt-4 px-4" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>

      {/* ── Real stats ── */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white">
          <h5 className="mb-0">Learning Statistics</h5>
        </div>
        <div className="card-body">
          <div className="row g-4 text-center">
            <div className="col-md-4">
              <div className="stat-box bg-warning-subtle">
                <h3>{stats.currentStreak}</h3>
                <p>Day Streak 🔥</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-box bg-success-subtle">
                <h3>{stats.completedCourses}</h3>
                <p>Courses Completed 🎓</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-box bg-primary-subtle">
                <h3>{stats.avgScore}%</h3>
                <p>Average Quiz Score 📊</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Certificates from API ── */}
      <div className="card shadow-sm">
        <div className="card-header bg-white">
          <h5 className="mb-0">My Certifications</h5>
        </div>
        <div className="card-body">
          {certificates.length === 0 ? (
            <div className="text-center text-muted py-4">
              No certificates earned yet. Pass a course quiz to earn one!
            </div>
          ) : (
            <div className="row g-3">
              {certificates.map(cert => (
                <div key={cert.certificateId} className="col-md-6">
                  <div className="certificate-card p-3">
                    <h6 className="fw-bold mb-2">{cert.courseTitle}</h6>
                    <p className="mb-1"><strong>Score:</strong> {cert.percentage}%</p>
                    <p className="mb-0 text-muted">
                      {new Date(cert.issuedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
