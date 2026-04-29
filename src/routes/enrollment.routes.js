const express = require('express');
const router  = express.Router();

const {
  enrollInCourse,
  getMyEnrollments,
  updateProgress,
  getCourseStudents,
} = require('../controllers/enrollment.controller');

const { protect }    = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');

// All enrollment routes require login
router.use(protect);

router.get('/my',                       restrictTo('student'),    getMyEnrollments);
router.post('/:courseId',               restrictTo('student'),    enrollInCourse);
router.put('/:courseId/progress',       restrictTo('student'),    updateProgress);
router.get('/:courseId/students',       restrictTo('instructor'), getCourseStudents);

module.exports = router;