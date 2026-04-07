// Instructor.js
// Added a domain guard at the TOP of the component.
// Even if someone manually sets userRole=instructor in localStorage,
// the email domain check will redirect them to /dashboard.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/instructor.css";

const BASE_URL          = process.env.REACT_APP_API_URL || "http://localhost:5000";
const INSTRUCTOR_DOMAIN = "elpp.ac.in"; // keep in sync with backend + ProtectRoute

/* ── YouTube embed helper ── */
function getYouTubeEmbedUrl(url) {
  if (!url) return "";
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v"))
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    if (u.hostname === "youtu.be")
      return `https://www.youtube.com/embed${u.pathname}`;
  } catch { /* ignore */ }
  return "";
}

function Instructor() {
  const navigate = useNavigate();

  // ══════════════════════════════════════════════════════════════════════════
  // SECURITY GUARD — runs before any render
  // Three conditions must ALL be true to access this page:
  //   1. userRole in localStorage is "instructor"
  //   2. user.email ends with @elpp.ac.in
  //   3. A valid token exists
  // ══════════════════════════════════════════════════════════════════════════
  const [authorized, setAuthorized] = useState(false);
  const [checking,   setChecking]   = useState(true);

  useEffect(() => {
    const role  = localStorage.getItem("userRole");
    const token = localStorage.getItem("token");

    let allowed = false;

    if (role === "instructor" && token) {
      try {
        const user   = JSON.parse(localStorage.getItem("user") || "{}");
        const domain = user.email?.split("@")[1]?.toLowerCase();
        allowed = domain === INSTRUCTOR_DOMAIN.toLowerCase();
      } catch { /* parse error → deny */ }
    }

    if (!allowed) {
      navigate("/dashboard", { replace: true });
      return;
    }

    setAuthorized(true);
    setChecking(false);
  }, [navigate]);

  // ── State ────────────────────────────────────────────────────────────────
  const [course, setCourse] = useState({
    title: "", duration: "", details: "", category: "General",
    level: "Beginner", image: ""
  });
  const [noteEntries,   setNoteEntries]   = useState([]);
  const [videoEntries,  setVideoEntries]  = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [stats,         setStats]         = useState({ total: 0, pending: 0, approved: 0 });
  const [submitting,    setSubmitting]    = useState(false);
  const [activeSection, setActiveSection] = useState("info");

  // ── Load stats ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authorized) return;

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res   = await fetch(`${BASE_URL}/api/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const approved = await res.json();

        let allCourses = Array.isArray(approved) ? approved : [];
        try {
          const allRes = await fetch(`${BASE_URL}/api/admin/all-courses`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (allRes.ok) allCourses = await allRes.json();
        } catch { /* not admin, ignore */ }

        const pendingCount  = Array.isArray(allCourses)
          ? allCourses.filter(c => c.status === "Pending").length : 0;
        const approvedCount = Array.isArray(approved) ? approved.length : 0;

        setStats({ total: pendingCount + approvedCount, pending: pendingCount, approved: approvedCount });
      } catch (error) {
        console.error("Stats error:", error);
      }
    };
    fetchStats();
  }, [authorized]);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleChange = (e) => setCourse({ ...course, [e.target.name]: e.target.value });

  const addVideoEntry    = () => setVideoEntries(p => [...p, { title: "", videoUrl: "", level: "Beginner" }]);
  const removeVideoEntry = (i) => setVideoEntries(p => p.filter((_, idx) => idx !== i));
  const updateVideoEntry = (i, field, value) =>
    setVideoEntries(p => { const u = [...p]; u[i] = { ...u[i], [field]: value }; return u; });

  const addNoteEntry    = () => setNoteEntries(p => [...p, { title: "", fileUrl: "", size: "" }]);
  const removeNoteEntry = (i) => setNoteEntries(p => p.filter((_, idx) => idx !== i));
  const updateNoteEntry = (i, field, value) =>
    setNoteEntries(p => { const u = [...p]; u[i] = { ...u[i], [field]: value }; return u; });

  const addQuestion    = () => setQuizQuestions(p => [...p, { question: "", options: ["","","",""], correctAnswer: 0 }]);
  const removeQuestion = (i) => setQuizQuestions(p => p.filter((_, idx) => idx !== i));
  const updateQuestion = (i, field, value) =>
    setQuizQuestions(p => { const u = [...p]; u[i] = { ...u[i], [field]: value }; return u; });
  const updateOption   = (qi, oi, value) =>
    setQuizQuestions(p => { const u = [...p]; const opts = [...u[qi].options]; opts[oi] = value; u[qi] = { ...u[qi], options: opts }; return u; });
  const setCorrectAnswer = (qi, oi) =>
    setQuizQuestions(p => { const u = [...p]; u[qi] = { ...u[qi], correctAnswer: oi }; return u; });

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const courseData = {
        title:       course.title,
        description: course.details,
        duration:    course.duration,
        category:    course.category,
        level:       course.level,
        image:       course.image,
        videos:      videoEntries.filter(v => v.title.trim() && v.videoUrl.trim())
                       .map((v, i) => ({ title: v.title, videoUrl: v.videoUrl, level: v.level, order: i })),
        notes:       noteEntries.filter(n => n.title.trim())
                       .map(n => ({ title: n.title, fileUrl: n.fileUrl, size: n.size })),
        quizQuestions: quizQuestions.filter(q => q.question.trim() && q.options.every(o => o.trim()))
      };

      const res  = await fetch(`${BASE_URL}/api/courses`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify(courseData)
      });
      const data = await res.json();

      if (res.ok) {
        alert("✅ Course submitted for admin approval!");
        setStats(p => ({ ...p, total: p.total + 1, pending: p.pending + 1 }));
        setCourse({ title: "", duration: "", details: "", category: "General", level: "Beginner", image: "" });
        setNoteEntries([]); setVideoEntries([]); setQuizQuestions([]);
        setActiveSection("info");
      } else {
        alert(data.message || "Failed to create course");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Error submitting course.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Guard render ─────────────────────────────────────────────────────────
  if (checking) return null; // brief flash prevention
  if (!authorized) return null;

  const validQuizCount = quizQuestions.filter(
    q => q.question.trim() && q.options.every(o => o.trim())
  ).length;

  const sections = [
    { key: "info",  label: "📋 Course Info" },
    { key: "desc",  label: "📝 Description" },
    { key: "video", label: "🎬 Video" },
    { key: "notes", label: "📄 PDF Notes" },
    { key: "quiz",  label: "❓ Quiz" }
  ];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-content">

        {/* ── Header ── */}
        <div className="instructor-header">
          <h2>Instructor Dashboard</h2>
          <p>Create and manage professional learning content</p>
        </div>

        {/* ── Stats ── */}
        <div className="stats-row">
          <div className="stats-card total">
            <span className="stats-icon">📚</span>
            <div><h6>Total Courses</h6><h3>{stats.total}</h3></div>
          </div>
          <div className="stats-card pending">
            <span className="stats-icon">⏳</span>
            <div><h6>Pending Approval</h6><h3>{stats.pending}</h3></div>
          </div>
          <div className="stats-card approved">
            <span className="stats-icon">✅</span>
            <div><h6>Approved</h6><h3>{stats.approved}</h3></div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="section-tabs">
          {sections.map(s => (
            <button
              key={s.key}
              type="button"
              className={`section-tab ${activeSection === s.key ? "active" : ""}`}
              onClick={() => setActiveSection(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="instructor-form">

          {/* ── Course Info ── */}
          {activeSection === "info" && (
            <div className="form-section animate-in">
              <div className="section-header">
                <h4>📋 Course Information</h4>
                <p>Enter the basic details of your course</p>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="course-title">Course Title</label>
                  <input id="course-title" type="text" name="title"
                    placeholder="e.g., Introduction to Machine Learning"
                    value={course.title} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="course-duration">Duration</label>
                  <input id="course-duration" type="text" name="duration"
                    placeholder="e.g., 8 weeks"
                    value={course.duration} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-grid-3">
                <div className="form-group">
                  <label>Category</label>
                  <select name="category" value={course.category} onChange={handleChange}>
                    <option value="General">General</option>
                    <option value="AI">AI</option>
                    <option value="Web">Web</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Mobile">Mobile</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Level</label>
                  <select name="level" value={course.level} onChange={handleChange}>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Cover Image URL</label>
                  <input type="url" name="image"
                    placeholder="https://example.com/image.jpg"
                    value={course.image} onChange={handleChange} />
                </div>
              </div>
            </div>
          )}

          {/* ── Description ── */}
          {activeSection === "desc" && (
            <div className="form-section animate-in">
              <div className="section-header">
                <h4>📝 Course Description</h4>
                <p>Provide a detailed overview for students</p>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows="8" name="details"
                  placeholder="Describe what students will learn..."
                  value={course.details} onChange={handleChange} required />
              </div>
              <div className="char-count">{course.details.length} characters</div>
            </div>
          )}

          {/* ── Videos ── */}
          {activeSection === "video" && (
            <div className="form-section animate-in">
              <div className="section-header">
                <h4>🎬 YouTube Videos</h4>
                <p>Add YouTube video lectures for this course</p>
              </div>
              {videoEntries.length === 0 && (
                <div className="quiz-empty"><span>🎬</span><p>No videos yet. Click below to add one.</p></div>
              )}
              {videoEntries.map((video, i) => {
                const previewUrl = getYouTubeEmbedUrl(video.videoUrl);
                return (
                  <div key={i} className="quiz-question-card">
                    <div className="quiz-question-header">
                      <span className="q-number">🎬 {i + 1}</span>
                      <button type="button" className="q-remove" onClick={() => removeVideoEntry(i)}>🗑️ Remove</button>
                    </div>
                    <div className="form-grid-2">
                      <div className="form-group">
                        <label>Video Title</label>
                        <input type="text" placeholder="e.g., Lesson 1 - Intro"
                          value={video.title} onChange={e => updateVideoEntry(i, "title", e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Level</label>
                        <select value={video.level} onChange={e => updateVideoEntry(i, "level", e.target.value)}>
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>YouTube URL</label>
                      <input type="url" placeholder="https://www.youtube.com/watch?v=..."
                        value={video.videoUrl} onChange={e => updateVideoEntry(i, "videoUrl", e.target.value)} />
                    </div>
                    {previewUrl && (
                      <div className="video-preview mt-3" style={{ maxWidth: 400 }}>
                        <h6>Preview</h6>
                        <div className="video-wrapper">
                          <iframe src={previewUrl} title="Preview" frameBorder="0" allowFullScreen />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <button type="button" className="add-question-btn" onClick={addVideoEntry}>➕ Add Video</button>
            </div>
          )}

          {/* ── Notes ── */}
          {activeSection === "notes" && (
            <div className="form-section animate-in">
              <div className="section-header">
                <h4>📄 Course Notes</h4>
                <p>Add links to notes & PDFs (Google Drive, Dropbox, etc.)</p>
              </div>
              {noteEntries.length === 0 && (
                <div className="quiz-empty"><span>📝</span><p>No notes yet. Click below to add one.</p></div>
              )}
              {noteEntries.map((note, i) => (
                <div key={i} className="quiz-question-card">
                  <div className="quiz-question-header">
                    <span className="q-number">📄 {i + 1}</span>
                    <button type="button" className="q-remove" onClick={() => removeNoteEntry(i)}>🗑️ Remove</button>
                  </div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Note Title</label>
                      <input type="text" placeholder="e.g., Chapter 1 - Introduction"
                        value={note.title} onChange={e => updateNoteEntry(i, "title", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>File URL</label>
                      <input type="url" placeholder="https://drive.google.com/file/d/..."
                        value={note.fileUrl} onChange={e => updateNoteEntry(i, "fileUrl", e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>File Size (optional)</label>
                    <input type="text" placeholder="e.g., 2.4 MB" value={note.size}
                      onChange={e => updateNoteEntry(i, "size", e.target.value)} style={{ maxWidth: 200 }} />
                  </div>
                </div>
              ))}
              <button type="button" className="add-question-btn" onClick={addNoteEntry}>➕ Add Note Link</button>
              {noteEntries.filter(n => n.title.trim()).length > 0 && (
                <div className="quiz-summary">
                  ✅ {noteEntries.filter(n => n.title.trim()).length} note(s) ready
                </div>
              )}
            </div>
          )}

          {/* ── Quiz ── */}
          {activeSection === "quiz" && (
            <div className="form-section animate-in">
              <div className="section-header">
                <h4>❓ Quiz Builder</h4>
                <p>Create quiz questions — students are auto-scored</p>
              </div>
              {quizQuestions.length === 0 && (
                <div className="quiz-empty"><span>📝</span><p>No questions yet.</p></div>
              )}
              {quizQuestions.map((q, qi) => (
                <div key={qi} className="quiz-question-card">
                  <div className="quiz-question-header">
                    <span className="q-number">Q{qi + 1}</span>
                    <button type="button" className="q-remove" onClick={() => removeQuestion(qi)}>🗑️ Remove</button>
                  </div>
                  <div className="form-group">
                    <label>Question</label>
                    <input type="text" placeholder="Enter your question..."
                      value={q.question} onChange={e => updateQuestion(qi, "question", e.target.value)} />
                  </div>
                  <div className="options-grid">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="option-row">
                        <label className={`option-radio ${q.correctAnswer === oi ? "correct" : ""}`}>
                          <input type="radio" name={`correct-${qi}`}
                            checked={q.correctAnswer === oi}
                            onChange={() => setCorrectAnswer(qi, oi)} />
                          <span className="radio-label">{String.fromCharCode(65 + oi)}</span>
                        </label>
                        <input type="text" placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                          value={opt} onChange={e => updateOption(qi, oi, e.target.value)} />
                      </div>
                    ))}
                  </div>
                  <div className="correct-hint">
                    ✅ Correct: <strong>{String.fromCharCode(65 + q.correctAnswer)}
                    {q.options[q.correctAnswer] ? ` — ${q.options[q.correctAnswer]}` : ""}</strong>
                  </div>
                </div>
              ))}
              <button type="button" className="add-question-btn" onClick={addQuestion}>➕ Add Question</button>
              {validQuizCount > 0 && (
                <div className="quiz-summary">✅ {validQuizCount} valid question(s) ready</div>
              )}
            </div>
          )}

          {/* ── Submit bar ── */}
          <div className="submit-area">
            <div className="submit-info">
              <span>📚 {course.title || "Untitled"}</span>
              <span>📄 {noteEntries.filter(n => n.title.trim()).length} Note(s)</span>
              <span>❓ {validQuizCount} Quiz Q(s)</span>
            </div>
            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? "⏳ Submitting..." : "🚀 Submit for Approval"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Instructor;