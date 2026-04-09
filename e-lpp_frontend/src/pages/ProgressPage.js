import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import "../styles/progress.css";

/* Static Course Progress (unchanged) */
const courseProgress = [
  { id: 1, course: "Introduction to Machine Learning", progress: 75, status: "In Progress" },
  { id: 2, course: "Advanced React Development", progress: 100, status: "Completed" },
  { id: 3, course: "Data Structures & Algorithms", progress: 45, status: "In Progress" },
  { id: 4, course: "Python for Data Science", progress: 100, status: "Completed" }
];

export default function ProgressPage() {
  const [quizHistory, setQuizHistory] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  // Dynamic progress state
  const [myProgress, setMyProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  /* Load Quiz History and Progress Data */
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem("quizHistory")) || [];
    setQuizHistory(savedHistory);

    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:5000/api/progress/my-progress", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setMyProgress(data);
        }
      } catch (error) {
        console.error("Error fetching progress:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  /* ================= DELETE FEATURE ================= */

  const handleSelectRow = (index) => {
    if (selectedRows.includes(index)) {
      setSelectedRows(selectedRows.filter(i => i !== index));
    } else {
      setSelectedRows([...selectedRows, index]);
    }
  };

  const handleDeleteSelected = () => {
    const updatedHistory = quizHistory.filter(
      (_, index) => !selectedRows.includes(index)
    );

    setQuizHistory(updatedHistory);
    localStorage.setItem("quizHistory", JSON.stringify(updatedHistory));
    setSelectedRows([]);
    setSelectMode(false);
  };

  /* ================= STREAK CALCULATION (UNCHANGED) ================= */

  function calculateStreaks(history) {
    if (!history.length) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    const passedQuizzes = history
      .filter(q => q.score >= 60)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (!passedQuizzes.length) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    const uniqueDates = [
      ...new Set(
        passedQuizzes.map(q =>
          new Date(q.date).toDateString()
        )
      )
    ].map(date => new Date(date))
     .sort((a, b) => b - a);

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    const today = new Date();
    let checkDate = new Date(today);

    for (let i = 0; i < uniqueDates.length; i++) {
      const diff =
        Math.floor(
          (checkDate - uniqueDates[i]) / (1000 * 60 * 60 * 24)
        );

      if (diff === 0 || diff === 1) {
        currentStreak++;
        checkDate = new Date(uniqueDates[i]);
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    for (let i = 1; i < uniqueDates.length; i++) {
      const diff =
        Math.floor(
          (uniqueDates[i - 1] - uniqueDates[i]) /
          (1000 * 60 * 60 * 24)
        );

      if (diff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    return { currentStreak, longestStreak };
  }

  const { currentStreak, longestStreak } =
    calculateStreaks(quizHistory);

  const totalQuizzes = quizHistory.length;

  const averageScore =
    totalQuizzes > 0
      ? Math.round(
          quizHistory.reduce((acc, q) => acc + q.score, 0) /
            totalQuizzes
        )
      : 0;

  /* ================= UI ================= */

  return (
    <div className="container mt-4 progress-page">

      <h2 className="fw-bold">Study Progress & Streak</h2>
      <p className="text-muted mb-4">
        Track your learning journey and maintain your streak
      </p>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <StatCard title="Current Streak" value={`${currentStreak} days`} color="warning" />
        <StatCard title="Longest Streak" value={`${longestStreak} days`} color="primary" />
        <StatCard title="Total Quizzes" value={totalQuizzes} color="dark" />
        <StatCard title="Average Score" value={`${averageScore}%`} color="success" />
      </div>

      {/* Streak Rules */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="fw-semibold mb-3">🔥 How Streaks Work</h5>
          <ul className="small text-muted ps-3">
            <li>Score <strong>60% or higher</strong> in a quiz to maintain streak</li>
            <li>Only one quiz per day counts</li>
            <li>Missing a day resets the streak</li>
            <li>Consistency is key 💡</li>
          </ul>
        </div>
      </div>

      {/* Course Progress */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="fw-semibold mb-3">Course Progress</h5>
          {loading ? (
            <p>Loading progress...</p>
          ) : !myProgress || myProgress.courses.length === 0 ? (
            <p className="text-muted">You have not registered for any courses yet.</p>
          ) : (
            myProgress.courses.map((c) => (
              <div key={c.enrollmentId} className="mb-3">
                <div className="d-flex justify-content-between mb-1 text-sm align-items-center">
                  <div>
                    <span className="fw-medium">{c.courseTitle}</span>
                    <span className="badge bg-secondary ms-2">{c.level || 'Beginner'}</span>
                  </div>
                  <span className={`badge ${c.progress === 100 ? "bg-success" : "bg-primary"}`}>
                    {c.progress === 100 ? "Completed" : "In Progress"}
                  </span>
                </div>
                <div className="progress mt-2" style={{ height: "12px" }}>
                  <div
                    className="progress-bar"
                    style={{ width: `${c.progress}%` }}
                  >
                    {c.progress}%
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quiz History */}
      <div className="card">
        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-semibold mb-0">Quiz History</h5>

            <div>
              {!selectMode && quizHistory.length > 0 && (
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setSelectMode(true)}
                >
                  Select
                </button>
              )}

              {selectMode && (
                <>
                  {selectedRows.length > 0 && (
                    <button
                      className="btn btn-danger btn-sm me-2"
                      onClick={handleDeleteSelected}
                    >
                      <FaTrash className="me-1" />
                      Delete
                    </button>
                  )}

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setSelectMode(false);
                      setSelectedRows([]);
                    }}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          {quizHistory.length === 0 ? (
            <p className="text-muted">No quiz attempts yet.</p>
          ) : (
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  {selectMode && <th></th>}
                  <th>Quiz</th>
                  <th>Score</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {quizHistory.map((q, index) => (
                  <tr key={index}>
                    {selectMode && (
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(index)}
                          onChange={() => handleSelectRow(index)}
                        />
                      </td>
                    )}
                    <td>{q.quiz}</td>
                    <td className={q.score >= 60 ? "text-success fw-semibold" : "text-danger fw-semibold"}>
                      {q.score}%
                    </td>
                    <td>{new Date(q.date).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${q.score >= 60 ? "bg-success" : "bg-danger"}`}>
                        {q.score >= 60 ? "Passed" : "Failed"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        </div>
      </div>

    </div>
  );
}

/* Reusable Stat Card */
function StatCard({ title, value, color }) {
  return (
    <div className="col-md-3 col-sm-6">
      <div className={`card border-${color}`}>
        <div className="card-body">
          <small className="text-muted">{title}</small>
          <h4 className={`fw-bold text-${color}`}>{value}</h4>
        </div>
      </div>
    </div>
  );
}
