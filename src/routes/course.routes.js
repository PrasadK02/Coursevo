const express = require('express');
const router  = express.Router();

const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  addLesson,
  getMyCourses,
} = require('../controllers/course.controller');

const { protect }      = require('../middleware/auth.middleware');
const { restrictTo }   = require('../middleware/role.middleware');
const validate         = require('../middleware/validate.middleware');
const { uploadThumbnail, uploadVideo } = require('../services/cloudinary.service');
const { createCourseValidator, addLessonValidator } = require('../validators/course.validator');

// ── Public routes ────────────────────────────────────────────────
router.get('/',    getAllCourses);

// ── Protected: instructor only ───────────────────────────────────
router.get(
  '/my',
  protect,
  restrictTo('instructor'),
  getMyCourses
);

router.post(
  '/',
  protect,
  restrictTo('instructor'),
  uploadThumbnail.single('thumbnail'),   // multer processes the file BEFORE validator
  createCourseValidator,
  validate,
  createCourse
);

router.put(
  '/:id',
  protect,
  restrictTo('instructor'),
  uploadThumbnail.single('thumbnail'),
  validate,
  updateCourse
);

router.delete(
  '/:id',
  protect,
  restrictTo('instructor'),
  deleteCourse
);

router.post(
  '/:id/lessons',
  protect,
  restrictTo('instructor'),
  uploadVideo.single('video'),
  addLessonValidator,
  validate,
  addLesson
);

// ── Public route (must be AFTER /my to avoid conflict) ───────────
router.get('/:id', protect, getCourseById);   // protect is optional here — used for draft visibility check

module.exports = router;