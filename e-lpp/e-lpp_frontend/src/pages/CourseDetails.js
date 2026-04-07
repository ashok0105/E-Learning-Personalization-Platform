import { useParams, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import {
  FaDownload,
  FaFilePdf,
  FaPlayCircle,
  FaLock,
  FaCheckCircle,
  FaYoutube
} from "react-icons/fa";
import "../styles/coursedetails.css";

const BASE_URL = "http://localhost:5000";

/* ── Helper — extract YouTube embed URL ── */
function getYouTubeEmbedUrl(url) {
  if (!url) return "";
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
  } catch {
    /* ignore bad URL */
  }
  return "";
}

function CourseDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);
  const [courseCompleted, setCourseCompleted] = useState(false);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  const isFromMyCourse = location.state?.fromMyCourse;

  /* ── Fetch course data ── */
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/courses/${id}`);
        const data = await res.json();
        if (res.ok) {
          setCourse(data);
        } else {
          console.error("Course fetch error:", data.message);
        }
      } catch (err) {
        console.error("Network error fetching course:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  /* ── Check enrollment & completion status ── */
  useEffect(() => {
    const checkEnrollment = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${BASE_URL}/api/enrollment/my-courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          const enrolled = data.find(
            (c) => (c.id || c._id)?.toString() === id
          );
          if (enrolled) {
            setAlreadyEnrolled(true);
            // Course is completed if progress === 100 or completedAt is set or quizPassed
            if (
              enrolled.progress >= 100 ||
              enrolled.completedAt ||
              enrolled.quizPassed
            ) {
              setCourseCompleted(true);
            }
          }
        }
      } catch (err) {
        console.error("Enrollment check error:", err);
      }
    };

    checkEnrollment();
  }, [id]);

  /* ── Enroll handler ── */
  const handleRegister = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to enroll in this course.");
      navigate("/login");
      return;
    }

    setEnrolling(true);
    try {
      const res = await fetch(`${BASE_URL}/api/enrollment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ courseId: id })
      });

      const data = await res.json();
      if (res.ok || res.status === 200) {
        alert("Successfully enrolled! 🎉 Go to My Courses to start learning.");
        navigate("/my-courses");
      } else {
        alert(data.message || "Failed to enroll");
      }
    } catch (err) {
      console.error("Enroll error:", err);
      alert("Server error. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

  /* ── Download note (only if course completed) ── */
  const handleDownloadNote = (note) => {
    if (!courseCompleted) {
      alert("🔒 Complete the course first to download notes!");
      return;
    }
    if (note.fileUrl) {
      window.open(note.fileUrl, "_blank", "noopener,noreferrer");
    } else {
      alert("No download link available for this note.");
    }
  };

  /* ── LOADING STATE ── */
  if (loading)
    return (
      <div className="layout-wrapper">
        <Sidebar />
        <div className="course-content container-fluid d-flex align-items-center justify-content-center">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <p>Loading course...</p>
          </div>
        </div>
      </div>
    );

  /* ── NOT FOUND ── */
  if (!course)
    return (
      <div className="layout-wrapper">
        <Sidebar />
        <div className="course-content container-fluid">
          <div className="alert alert-danger mt-4">Course not found.</div>
        </div>
      </div>
    );

  /* ── Derived values ── */
  const videos = course.videos || [];
  const notes = course.notes || [];
  const activeVideo = videos[activeVideoIndex];
  const activeEmbedUrl = activeVideo
    ? getYouTubeEmbedUrl(activeVideo.videoUrl)
    : "";

  return (
    <div className="layout-wrapper">
      <Sidebar />

      <div className="course-content container-fluid">
        {/* ── Course Header ── */}
        <div className="course-header">
          <h2>{course.title}</h2>
          <p>{course.description}</p>
          {course.instructor && (
            <p className="text-muted">
              <strong>Instructor:</strong>{" "}
              {course.instructor.name || course.instructorName || "Instructor"}
            </p>
          )}
          {course.duration && (
            <p className="text-muted">
              <strong>Duration:</strong> {course.duration}
            </p>
          )}
          {alreadyEnrolled && (
            <span
              className={`enrollment-badge ${
                courseCompleted ? "completed" : "enrolled"
              }`}
            >
              {courseCompleted ? "✅ Course Completed" : "📚 Enrolled"}
            </span>
          )}
        </div>

        {/* ══════════════════════════════════════════════
            VIDEO SECTION
            ══════════════════════════════════════════════ */}
        <div className="card custom-card mb-4">
          <div className="card-body">
            <h5 className="section-title">
              <FaPlayCircle className="icon-primary" />
              Course Video Lectures ({videos.length})
            </h5>

            {videos.length > 0 ? (
              <div className="video-section-layout">
                {/* ── Video Player ── */}
                <div className="video-player-area">
                  {activeEmbedUrl ? (
                    <div className="video-embed-wrapper">
                      <iframe
                        src={activeEmbedUrl}
                        title={activeVideo.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : activeVideo?.videoUrl ? (
                    <div className="video-embed-wrapper">
                      <div className="video-link-fallback">
                        <FaYoutube className="yt-icon" />
                        <p>Video cannot be embedded.</p>
                        <a
                          href={activeVideo.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-danger btn-sm"
                        >
                          Watch on YouTube
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="video-embed-wrapper">
                      <p className="text-muted text-center p-4">
                        No video URL provided for this lecture.
                      </p>
                    </div>
                  )}
                  <h6 className="current-video-title mt-2">
                    {activeVideo?.title || "Untitled Video"}
                    {activeVideo?.duration && (
                      <span className="video-duration">
                        {activeVideo.duration}
                      </span>
                    )}
                  </h6>
                </div>

                {/* ── Video List ── */}
                {videos.length > 1 && (
                  <div className="video-playlist">
                    <h6 className="playlist-title">All Lectures</h6>
                    {videos.map((video, index) => (
                      <div
                        key={video._id || index}
                        className={`playlist-item ${
                          index === activeVideoIndex ? "active" : ""
                        }`}
                        onClick={() => setActiveVideoIndex(index)}
                      >
                        <span className="playlist-index">{index + 1}</span>
                        <div className="playlist-info">
                          <div className="d-flex align-items-center">
                            <span className="playlist-video-title">
                              {video.title}
                            </span>
                            <span className={`badge ms-2 ${video.level === 'Advanced' ? 'bg-danger' : video.level === 'Intermediate' ? 'bg-warning' : 'bg-success'}`} style={{ fontSize: '0.65rem' }}>
                               {video.level || 'Beginner'}
                            </span>
                          </div>
                          {video.duration && (
                            <span className="playlist-duration">
                              {video.duration}
                            </span>
                          )}
                        </div>
                        {index === activeVideoIndex && (
                          <FaPlayCircle className="playing-icon" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="no-content-placeholder">
                <FaYoutube className="placeholder-icon" />
                <p>No video lectures have been added to this course yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            NOTES SECTION
            ══════════════════════════════════════════════ */}
        <div className="card custom-card mb-4">
          <div className="card-body">
            <h5 className="section-title">
              <FaFilePdf className="icon-primary" />
              Course Notes & PDFs ({notes.length})
            </h5>

            {notes.length > 0 ? (
              <>
                {!courseCompleted && (
                  <div className="notes-lock-banner">
                    <FaLock className="lock-icon" />
                    <span>
                      Complete the course to unlock note downloads
                    </span>
                  </div>
                )}

                {notes.map((note, index) => (
                  <div key={note._id || index} className="note-item">
                    <div className="note-info">
                      <FaFilePdf className="note-pdf-icon" />
                      <div>
                        <strong>{note.title}</strong>
                        {note.size && (
                          <small className="ms-2 text-muted">{note.size}</small>
                        )}
                      </div>
                    </div>

                    <div className="note-actions">
                      {courseCompleted ? (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleDownloadNote(note)}
                        >
                          <FaDownload /> Download
                        </button>
                      ) : (
                        <button
                          className="btn btn-outline-secondary btn-sm disabled-note-btn"
                          disabled
                          title="Complete the course to download"
                        >
                          <FaLock /> Locked
                        </button>
                      )}

                      {courseCompleted && note.fileUrl && (
                        <a
                          href={note.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-primary btn-sm"
                        >
                          View Online
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="no-content-placeholder">
                <FaFilePdf className="placeholder-icon" />
                <p>No notes have been added to this course yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            ACTION BUTTON
            ══════════════════════════════════════════════ */}
        <div className="text-center mt-4 mb-5">
          {isFromMyCourse || alreadyEnrolled ? (
            <button
              className="btn btn-success btn-lg action-btn"
              onClick={() =>
                navigate("/quiz", {
                  state: { courseId: id, courseName: course.title }
                })
              }
            >
              🎯 Start Quiz
            </button>
          ) : (
            <button
              className="btn btn-primary btn-lg action-btn"
              onClick={handleRegister}
              disabled={enrolling}
            >
              {enrolling ? "Enrolling..." : "Register for This Course"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseDetails;
