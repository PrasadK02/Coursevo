const Enrollment  = require('../models/Enrollment');
const Course      = require('../models/Course');
const ApiError    = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// ─── POST /enrollments/:courseId ─────────────────────────────────
// Student enrolls in a course.
const enrollInCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) return next(new ApiError(404, 'Course not found'));
    if (!course.isPublished) return next(new ApiError(400, 'Course is not available'));

    // Check if already enrolled — the unique index would also catch this,
    // but a friendly error message is better than a MongoDB duplicate key crash
    const existing = await Enrollment.findOne({
      student: req.user._id,
      course:  req.params.courseId,
    });
    if (existing) return next(new ApiError(409, 'You are already enrolled in this course'));

    const enrollment = await Enrollment.create({
      student: req.user._id,
      course:  req.params.courseId,
    });

    // Increment the cached enrollment count on the course
    await Course.findByIdAndUpdate(req.params.courseId, {
      $inc: { enrollmentCount: 1 },
    });

    return res.status(201).json(
      new ApiResponse(201, { enrollment }, 'Enrolled successfully')
    );
  } catch (err) {
    next(err);
  }
};

// ─── GET /enrollments/my ─────────────────────────────────────────
// Returns all courses the logged-in student is enrolled in.
const getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({
        path: 'course',
        select: 'title description thumbnail instructor level enrollmentCount',
        populate: { path: 'instructor', select: 'name avatar' },
      })
      .sort({ enrolledAt: -1 });

    return res.status(200).json(new ApiResponse(200, { enrollments }));
  } catch (err) {
    next(err);
  }
};

// ─── PUT /enrollments/:courseId/progress ─────────────────────────
// Student marks a lesson as complete.
// Body: { lessonId: "..." }
const updateProgress = async (req, res, next) => {
  try {
    const { lessonId } = req.body;
    if (!lessonId) return next(new ApiError(400, 'lessonId is required'));

    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course:  req.params.courseId,
    });
    if (!enrollment) return next(new ApiError(404, 'Enrollment not found'));

    // Don't add the same lesson twice
    const alreadyDone = enrollment.progress.some(
      (p) => p.lessonId.toString() === lessonId
    );
    if (alreadyDone) {
      return res.status(200).json(
        new ApiResponse(200, { enrollment }, 'Lesson already marked complete')
      );
    }

    // Push the completed lesson into progress array
    enrollment.progress.push({ lessonId });

    // Recalculate completion percentage
    const course = await Course.findById(req.params.courseId).select('lessons');
    const totalLessons = course.lessons.length;

    if (totalLessons > 0) {
      enrollment.completionPercent = Math.round(
        (enrollment.progress.length / totalLessons) * 100
      );
    }

    if (enrollment.completionPercent === 100) {
      enrollment.isCompleted = true;
    }

    await enrollment.save();

    return res.status(200).json(
      new ApiResponse(200, { enrollment }, 'Progress updated')
    );
  } catch (err) {
    next(err);
  }
};

// ─── GET /enrollments/:courseId/students ─────────────────────────
// Instructor only. See who enrolled in their course.
const getCourseStudents = async (req, res, next) => {
  try {
    // Verify the requesting user is the course instructor
    const course = await Course.findById(req.params.courseId);
    if (!course) return next(new ApiError(404, 'Course not found'));

    if (!course.instructor.equals(req.user._id)) {
      return next(new ApiError(403, 'Access denied'));
    }

    const enrollments = await Enrollment.find({ course: req.params.courseId })
      .populate('student', 'name email avatar')
      .select('student completionPercent isCompleted enrolledAt')
      .sort({ enrolledAt: -1 });

    return res.status(200).json(
      new ApiResponse(200, {
        total: enrollments.length,
        enrollments,
      })
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  enrollInCourse,
  getMyEnrollments,
  updateProgress,
  getCourseStudents,
};