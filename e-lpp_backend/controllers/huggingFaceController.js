const axios = require("axios");

const HF_API_URL = "https://api-inference.huggingface.co/models";
const HF_TOKEN   = () => process.env.HUGGINGFACE_API_KEY; // read lazily so .env loads first

// ─── Helper: call any HF Inference API model ────────────────────────────────
async function callHuggingFace(model, payload) {
  const res = await axios.post(
    `${HF_API_URL}/${model}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${HF_TOKEN()}`,
        "Content-Type": "application/json"
      },
      timeout: 30000 // 30 s — cold-start models can be slow
    }
  );
  return res.data;
  
}


// ════════════════════════════════════════════════════════════════════════════
// POST /api/ai/recommend-courses
//
// Ranks a list of courses by relevance to the student's interests.
// Uses zero-shot classification — no fine-tuning needed.
//
// Body: { interests: "machine learning, python", courses: ["title1","title2",...] }
// ════════════════════════════════════════════════════════════════════════════
exports.recommendCourses = async (req, res) => {
  try {
    const { interests, courses } = req.body;

    if (!interests || !Array.isArray(courses) || courses.length === 0) {
      return res.status(400).json({ message: "interests (string) and courses (array) are required" });
    }

    // facebook/bart-large-mnli is free, accurate, and fast for zero-shot
    const result = await callHuggingFace(
      "facebook/bart-large-mnli",
      {
        inputs: interests,
        parameters: { candidate_labels: courses }
      }
    );

    // result.labels is already sorted highest → lowest score
    const ranked = result.labels.map((label, i) => ({
      course: label,
      score:  parseFloat(result.scores[i].toFixed(4))
    }));

    res.json({ interests, ranked });
  } catch (error) {
    handleHFError(error, res, "course recommendation");
  }
};


// ════════════════════════════════════════════════════════════════════════════
// POST /api/ai/explain-answer
//
// Explains why a quiz answer is correct in plain language.
// Great for the quiz results screen.
//
// Body: { question: "What is...", correctAnswer: "The answer", context: "optional course text" }
// ════════════════════════════════════════════════════════════════════════════
exports.explainAnswer = async (req, res) => {
  try {
    const { question, correctAnswer, context } = req.body;

    if (!question || !correctAnswer) {
      return res.status(400).json({ message: "question and correctAnswer are required" });
    }

    const prompt = context
      ? `Context: ${context}\n\nQuestion: ${question}\nCorrect answer: ${correctAnswer}\nExplain why this answer is correct in 2-3 sentences:`
      : `Question: ${question}\nCorrect answer: ${correctAnswer}\nExplain why this answer is correct in 2-3 sentences:`;

    // google/flan-t5-large is free and good for short explanations
    const result = await callHuggingFace(
      "google/flan-t5-large",
      { inputs: prompt }
    );

    const explanation = Array.isArray(result)
      ? result[0]?.generated_text || "No explanation generated."
      : result?.generated_text || "No explanation generated.";

    res.json({ question, correctAnswer, explanation });
  } catch (error) {
    handleHFError(error, res, "answer explanation");
  }
};


// ════════════════════════════════════════════════════════════════════════════
// POST /api/ai/summarize
//
// Summarizes a course description or lecture notes into 2-3 sentences.
// Students can use this on the course details page.
//
// Body: { text: "long text here..." }
// ════════════════════════════════════════════════════════════════════════════
exports.summarize = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length < 100) {
      return res.status(400).json({ message: "text must be at least 100 characters" });
    }

    // facebook/bart-large-cnn is the standard free summarization model
    const result = await callHuggingFace(
      "facebook/bart-large-cnn",
      {
        inputs: text.slice(0, 1024), // model max input
        parameters: {
          max_length:  130,
          min_length:  30,
          do_sample:   false
        }
      }
    );

    const summary = Array.isArray(result)
      ? result[0]?.summary_text || "Could not summarize."
      : result?.summary_text || "Could not summarize.";

    res.json({ summary });
  } catch (error) {
    handleHFError(error, res, "summarization");
  }
};


// ════════════════════════════════════════════════════════════════════════════
// POST /api/ai/sentiment
//
// Analyses sentiment of a course review or student feedback.
// Useful for instructor dashboard analytics.
//
// Body: { text: "This course was amazing!" }
// ════════════════════════════════════════════════════════════════════════════
exports.sentiment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "text is required" });
    }

    const result = await callHuggingFace(
      "distilbert-base-uncased-finetuned-sst-2-english",
      { inputs: text.slice(0, 512) }
    );

    const scores = Array.isArray(result[0]) ? result[0] : result;
    const top    = scores.sort((a, b) => b.score - a.score)[0];

    res.json({
      text,
      sentiment: top.label,       // "POSITIVE" | "NEGATIVE"
      confidence: parseFloat(top.score.toFixed(4))
    });
  } catch (error) {
    handleHFError(error, res, "sentiment analysis");
  }
};


// ════════════════════════════════════════════════════════════════════════════
// POST /api/ai/generate-quiz-questions
//
// Generates quiz questions from any text (lecture notes, course description).
// Uses text2text-generation. Good alternative / supplement to Quizgecko.
//
// Body: { text: "...", numQuestions: 3 }
// ════════════════════════════════════════════════════════════════════════════
exports.generateQuizQuestions = async (req, res) => {
  try {
    const { text, numQuestions = 3 } = req.body;

    if (!text || text.trim().length < 50) {
      return res.status(400).json({ message: "text must be at least 50 characters" });
    }

    const count  = Math.min(Number(numQuestions), 10);
    const prompt = `Generate ${count} multiple choice quiz questions from the following text. Format each as: Q: [question] A) [option] B) [option] C) [option] D) [option] Answer: [letter]\n\nText: ${text.slice(0, 800)}`;

    const result = await callHuggingFace(
      "google/flan-t5-large",
      {
        inputs: prompt,
        parameters: { max_new_tokens: 500 }
      }
    );

    const raw = Array.isArray(result)
      ? result[0]?.generated_text || ""
      : result?.generated_text || "";

    res.json({ rawOutput: raw, note: "Parse the rawOutput to display questions in your UI" });
  } catch (error) {
    handleHFError(error, res, "quiz generation");
  }
};


// ─── Shared error handler ────────────────────────────────────────────────────
function handleHFError(error, res, feature) {
  const status = error.response?.status;
  const data   = error.response?.data;

  console.error(`HuggingFace [${feature}] error:`, status, typeof data === "object" ? JSON.stringify(data) : data);

  if (status === 401) {
    return res.status(401).json({ message: "Invalid HUGGINGFACE_API_KEY in .env" });
  }
  if (status === 503) {
    return res.status(503).json({
      message: "Model is loading (cold start). Retry in 20-30 seconds.",
      estimatedTime: data?.estimated_time || 20
    });
  }
  if (status === 429) {
    return res.status(429).json({ message: "HuggingFace rate limit reached. Try again shortly." });
  }

  res.status(500).json({ message: `Error during ${feature}`, error: error.message });
}