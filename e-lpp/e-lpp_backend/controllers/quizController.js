const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');

// Fetch a Quiz by its Course ID and Level
exports.getQuizByLevel = async (req, res) => {
    try {
        const { courseId, level } = req.params;

        const quiz = await Quiz.findOne({ course: courseId, level });

        if (!quiz) {
            return res.status(404).json({ message: "No quiz found for this level." });
        }

        // Strip answers before sending to frontend
        const sanitizedQuestions = quiz.questions.map(q => ({
            _id: q._id,
            question: q.question,
            options: q.options
        }));

        res.json({
            quizId: quiz._id,
            courseId: quiz.course,
            level: quiz.level,
            questions: sanitizedQuestions
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching quiz", error: error.message });
    }
};

// Receive answers, calculate score, return result
exports.submitQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { answers } = req.body; // Map of { questionId: selectedIndex }

        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: "Quiz not found." });

        let score = 0;

        // Evaluate answers
        quiz.questions.forEach(q => {
            const userAnswer = answers[q._id.toString()];
            if (userAnswer !== undefined && userAnswer === q.correctAnswer) {
                score++;
            }
        });

        const totalQuestions = quiz.questions.length;
        const percentage = Math.round((score / totalQuestions) * 100);
        const passed = percentage >= 60; // Configurable Pass Rate

        // Save the result for analysis
        const result = await QuizResult.create({
            user: req.user.id,
            quiz: quizId,
            course: quiz.course,
            score,
            totalQuestions,
            percentage,
            passed
        });

        res.json({
            message: "Quiz analyzed successfully",
            score,
            totalQuestions,
            percentage,
            passed,
            resultId: result._id
        });
    } catch (error) {
        res.status(500).json({ message: "Error analyzing quiz", error: error.message });
    }
};
