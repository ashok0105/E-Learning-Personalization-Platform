import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/quiz.css";

const BASE_URL = "https://e-learning-personalization-platform-8.onrender.com";

export default function QuizPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get courseId + courseName passed from CourseDetails via navigate state
  const courseId = location.state?.courseId || "";
  const courseName = location.state?.courseName || "Course Quiz";

  const [quizData, setQuizData] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ===== GET USER =====
  const getUserData = () => {
    try {
      return JSON.parse(localStorage.getItem("user")) || { name: "Student" };
    } catch {
      return { name: "Student" };
    }
  };
  const user = getUserData();

  // ===== FETCH QUIZ =====
  useEffect(() => {
    const fetchQuiz = async () => {
      if (!courseId) {
        setFetchError("No course selected. Please go to My Courses and start quiz from a course.");
        setLoadingQuiz(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/api/quiz/${courseId}/beginner`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (res.ok) {
          setQuizData(data);
        } else {
          setFetchError(data.message || "Failed to load quiz.");
        }
      } catch (err) {
        console.error("Quiz fetch error:", err);
        setFetchError("Network error fetching quiz. Make sure backend is running.");
      } finally {
        setLoadingQuiz(false);
      }
    };
    fetchQuiz();
  }, [courseId]);

  // ===== HANDLE SELECT =====
  const handleSelect = (questionId, index) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: index }));
  };

  // ===== HANDLE SUBMIT =====
  const handleSubmit = async () => {
    if (!quizData) return;
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      // Build answers map: { questionId: selectedIndex }
      const answersMap = {};
      quizData.questions.forEach(q => {
        const qId = q._id.toString();
        if (selectedAnswers[qId] !== undefined) {
          answersMap[qId] = selectedAnswers[qId];
        }
      });

      const res = await fetch(`${BASE_URL}/api/quiz/${quizData.quizId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ answers: answersMap })
      });

      const data = await res.json();

      if (res.ok) {
        setResultData(data);
        setShowResults(true);
      } else {
        alert(data.message || "Error submitting quiz");
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("Network error submitting quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  // ===== LOADING STATE =====
  if (loadingQuiz) {
    return (
      <div className="container quiz-container text-center py-5">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <p>Loading quiz questions...</p>
      </div>
    );
  }

  // ===== ERROR STATE =====
  if (fetchError) {
    return (
      <div className="container quiz-container">
        <div className="card quiz-card">
          <div className="card-body text-center">
            <h4 className="text-danger mb-3">⚠️ Quiz Not Available</h4>
            <p className="text-muted">{fetchError}</p>
            <button className="btn btn-primary mt-3" onClick={() => navigate("/my-courses")}>
              Go to My Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  const quizQuestions = quizData?.questions || [];
  const currentQ = quizQuestions[currentQuestion];

  // ===== RESULTS PAGE =====
  if (showResults && resultData) {
    const { score, totalQuestions, percentage, passed } = resultData;

    return (
      <div className="container quiz-container">
        <div className={`card quiz-card ${passed ? "success" : "fail"}`}>
          <div className="card-body text-center">
            <h2 className="mb-3">Quiz Completed! 🎉</h2>
            <h5>
              Score: {score} / {totalQuestions} ({percentage}%)
            </h5>

            {passed ? (
              <p className="text-success fw-bold mt-3">
                🔥 Excellent! You passed! Certificate earned.
              </p>
            ) : (
              <p className="text-danger fw-bold mt-3">
                Need 60% to earn certificate. You got {percentage}%. Try again!
              </p>
            )}

            {passed && (
              <div className="certificate-box mt-4 p-4">
                <h3>📜 Certificate of Completion</h3>
                <p>This certifies that</p>
                <h4 className="fw-bold">{user.name}</h4>
                <p>has successfully completed</p>
                <h5 className="fw-bold">{courseName}</h5>
                <h5>with {percentage}%</h5>
                <p className="text-muted">
                  Date: {new Date().toLocaleDateString()}
                </p>
                <button
                  className="btn btn-dark mt-3"
                  onClick={() => window.print()}
                >
                  🖨️ Print / Download Certificate
                </button>
              </div>
            )}

            <div className="mt-4 d-flex gap-3 justify-content-center">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setCurrentQuestion(0);
                  setSelectedAnswers({});
                  setResultData(null);
                  setShowResults(false);
                }}
              >
                Retake Quiz
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => navigate("/my-courses")}
              >
                Back to My Courses
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== QUIZ PAGE =====
  const totalAnswered = Object.keys(selectedAnswers).length;

  return (
    <div className="container quiz-container">
      <h2 className="mb-1">{courseName}</h2>
      <p className="text-muted">
        Question {currentQuestion + 1} of {quizQuestions.length}
      </p>

      {/* Progress Bar */}
      <div className="progress mb-4">
        <div
          className="progress-bar"
          style={{
            width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%`
          }}
        />
      </div>

      {currentQ && (
        <div className="card quiz-card">
          <div className="card-body">
            <h5>{currentQ.question}</h5>

            {currentQ.options.map((opt, index) => (
              <div
                key={index}
                className={`option ${selectedAnswers[currentQ._id] === index ? "active" : ""}`}
                onClick={() => handleSelect(currentQ._id, index)}
              >
                <input
                  type="radio"
                  checked={selectedAnswers[currentQ._id] === index}
                  readOnly
                />
                <span>{opt}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-4 d-flex justify-content-between">
        <button
          className="btn btn-outline-secondary"
          disabled={currentQuestion === 0}
          onClick={() => setCurrentQuestion(prev => prev - 1)}
        >
          Previous
        </button>

        {currentQuestion === quizQuestions.length - 1 ? (
          <button
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={totalAnswered < quizQuestions.length || submitting}
          >
            {submitting ? "Submitting..." : `Submit Quiz (${totalAnswered}/${quizQuestions.length} answered)`}
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() =>
              setCurrentQuestion(prev =>
                prev < quizQuestions.length - 1 ? prev + 1 : prev
              )
            }
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
