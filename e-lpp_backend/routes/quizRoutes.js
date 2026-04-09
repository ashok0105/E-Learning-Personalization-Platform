const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const auth = require('../middleware/authMiddleware');

// Get a quiz by specific course and level (protected)
router.get('/:courseId/:level', auth, quizController.getQuizByLevel);

// Submit answers for a specific quiz (protected)
router.post('/:quizId/submit', auth, quizController.submitQuiz);

module.exports = router;
