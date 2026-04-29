const express = require('express');
const router  = express.Router();

const {
  generateCourseQuiz,
  getQuiz,
  submitAttempt,
  getMyResults,
} = require('../controllers/quiz.controller');

const { protect }    = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');

// All quiz routes require login
router.use(protect);

router.post('/generate/:courseId', restrictTo('instructor'), generateCourseQuiz);
router.get('/:courseId',           restrictTo('student'),    getQuiz);
router.post('/:courseId/attempt',  restrictTo('student'),    submitAttempt);
router.get('/:courseId/results',   restrictTo('student'),    getMyResults);

module.exports = router;