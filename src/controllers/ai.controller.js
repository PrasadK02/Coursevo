const Course              = require('../models/Course');
const { askCourseQuestion } = require('../services/ai.service');
const ApiError            = require('../utils/ApiError');
const ApiResponse         = require('../utils/ApiResponse');

// POST /api/v1/ai/chat
// Body: { courseId, question }
// Student sends a question — we fetch the course, pass content to Gemini, return the answer

const chat = async (req, res, next) => {
  try {
    const { courseId, question } = req.body;

    if (!courseId) return next(new ApiError(400, 'courseId is required'));
    if (!question || question.trim().length === 0) {
      return next(new ApiError(400, 'question is required'));
    }
    if (question.length > 1000) {
      return next(new ApiError(400, 'Question must be under 1000 characters'));
    }

    // Fetch the course with its lessons (we need lesson content as context)
    const course = await Course.findById(courseId).select('title lessons isPublished');
    if (!course) return next(new ApiError(404, 'Course not found'));
    if (!course.isPublished) return next(new ApiError(400, 'Course is not available'));

    // Check that the course has lessons — can't answer from empty content
    if (!course.lessons || course.lessons.length === 0) {
      return next(new ApiError(400, 'This course has no content yet'));
    }

    // Call Gemini via our service
    const answer = await askCourseQuestion(question.trim(), course);

    return res.status(200).json(
      new ApiResponse(200, {
        question: question.trim(),
        answer,
        courseId,
      }, 'Answer generated')
    );
  } catch (err) {
    // Gemini API errors get a friendly message instead of a raw 500
    if (err.message?.includes('API key') || err.message?.includes('quota')) {
      return next(new ApiError(503, 'AI service temporarily unavailable'));
    }
    next(err);
  }
};

module.exports = { chat };