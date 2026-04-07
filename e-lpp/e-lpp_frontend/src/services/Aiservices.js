// src/services/aiService.js
// ─────────────────────────────────────────────────────────────────────────────
// Reusable async helpers for all HuggingFace AI endpoints.
// Import these in any component that needs AI features.
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`
});


// ── 1. Course Recommendations ─────────────────────────────────────────────
// Usage: in Dashboard.js or a dedicated "Recommended for you" section.
// interests — free-text string, e.g. "python, data science, machine learning"
// courses   — array of course title strings from /api/courses
//
// Returns: [{ course: "...", score: 0.87 }, ...]  sorted best → worst
export async function getRecommendations(interests, courses) {
  const res  = await fetch(`${BASE_URL}/api/ai/recommend-courses`, {
    method:  "POST",
    headers: authHeaders(),
    body:    JSON.stringify({ interests, courses })
  });
  return res.json(); // { interests, ranked: [...] }
}


// ── 2. Explain a Quiz Answer ──────────────────────────────────────────────
// Usage: in Quiz.js results screen, after submitting answers.
// Show an "Explain" button next to each question.
//
// Returns: { question, correctAnswer, explanation: "..." }
export async function explainAnswer(question, correctAnswer, context = "") {
  const res = await fetch(`${BASE_URL}/api/ai/explain-answer`, {
    method:  "POST",
    headers: authHeaders(),
    body:    JSON.stringify({ question, correctAnswer, context })
  });
  return res.json();
}


// ── 3. Summarise Course / Notes ───────────────────────────────────────────
// Usage: in CourseDetails.js — "Summarise this course" button.
// text — course description or notes content (min 100 chars)
//
// Returns: { summary: "..." }
export async function summarizeText(text) {
  const res = await fetch(`${BASE_URL}/api/ai/summarize`, {
    method:  "POST",
    headers: authHeaders(),
    body:    JSON.stringify({ text })
  });
  return res.json();
}


// ── 4. Sentiment Analysis (Instructor / Admin only) ───────────────────────
// Usage: in Instructor.js dashboard — analyse student feedback/reviews.
//
// Returns: { sentiment: "POSITIVE"|"NEGATIVE", confidence: 0.98 }
export async function analyzeSentiment(text) {
  const res = await fetch(`${BASE_URL}/api/ai/sentiment`, {
    method:  "POST",
    headers: authHeaders(),
    body:    JSON.stringify({ text })
  });
  return res.json();
}


// ── 5. Generate Quiz Questions from Text (Instructor / Admin only) ────────
// Usage: in Instructor.js quiz builder — paste lecture notes → get questions.
//
// Returns: { rawOutput: "Q: ... A) ... Answer: A\nQ: ..." }
export async function generateQuizFromText(text, numQuestions = 3) {
  const res = await fetch(`${BASE_URL}/api/ai/generate-quiz-questions`, {
    method:  "POST",
    headers: authHeaders(),
    body:    JSON.stringify({ text, numQuestions })
  });
  return res.json();
}