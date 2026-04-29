const Quiz              = require('../models/Quiz');
const Course            = require('../models/Course');
const { generateQuiz }  = require('../services/ai.service');
const ApiError          = require('../utils/ApiError');
const ApiResponse       = require('../utils/ApiResponse');

// ─── POST /quizzes/generate/:courseId ────────────────────────────
// Instructor only. Generates MCQs from course content via Gemini
// and saves them to the database. If a quiz already exists for this
// course, it gets replaced with the newly generated one.

const generateCourseQuiz = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return next(new ApiError(404, 'Course not found'));

    // Only the course owner can generate its quiz
    if (!course.instructor.equals(req.user._id)) {
      return next(new ApiError(403, 'You are not the owner of this course'));
    }

    if (!course.lessons || course.lessons.length === 0) {
      return next(new ApiError(400, 'Add lessons to the course before generating a quiz'));
    }

    // How many questions? Default 5, max 10
    const numberOfQuestions = Math.min(
      parseInt(req.body.numberOfQuestions) || 5,
      10
    );

    // Call Gemini — this takes a few seconds
    const questions = await generateQuiz(course, numberOfQuestions);

    // Replace existing quiz or create a new one
    // findOneAndUpdate with upsert=true means: update if found, create if not
    const quiz = await Quiz.findOneAndUpdate(
      { course: course._id },
      {
        course:      course._id,
        questions,
        generatedBy: req.user._id,
        attempts:    [],          // reset attempts when quiz is regenerated
      },
      { upsert: true, new: true }
    );

    return res.status(201).json(
      new ApiResponse(201, { quiz }, `Quiz generated with ${questions.length} questions`)
    );
  } catch (err) {
    if (err.message?.includes('JSON') || err.message?.includes('array')) {
      return next(new ApiError(502, 'AI returned an invalid response. Try again.'));
    }
    next(err);
  }
};

// ─── GET /quizzes/:courseId ───────────────────────────────────────
// Student only. Returns the quiz WITHOUT correct answers —
// we never send the answer key to the frontend before submission.

const getQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ course: req.params.courseId });
    if (!quiz) return next(new ApiError(404, 'No quiz found for this course'));

    // Strip correctAnswer and explanation from each question
    // so the student can't find it in the network response
    const safeQuestions = quiz.questions.map((q) => ({
      _id:      q._id,
      question: q.question,
      options:  q.options,
      // correctAnswer is intentionally excluded here
    }));

    return res.status(200).json(
      new ApiResponse(200, {
        quizId:    quiz._id,
        courseId:  quiz.course,
        questions: safeQuestions,
        total:     safeQuestions.length,
      })
    );
  } catch (err) {
    next(err);
  }
};

// ─── POST /quizzes/:courseId/attempt ─────────────────────────────
// Student submits their answers.
// Body: { answers: [{ questionId, selectedOption }] }
//
// We grade it server-side by comparing against stored correct answers.
// The student never has access to the answer key before submission.

const submitAttempt = async (req, res, next) => {
  try {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return next(new ApiError(400, 'answers array is required'));
    }

    const quiz = await Quiz.findOne({ course: req.params.courseId });
    if (!quiz) return next(new ApiError(404, 'No quiz found for this course'));

    // Grade each answer by looking up the correct answer from the DB
    let score = 0;
    const gradedAnswers = answers.map((answer) => {
      const question = quiz.questions.id(answer.questionId);
      if (!question) return null;

      const isCorrect = question.correctAnswer === answer.selectedOption;
      if (isCorrect) score++;

      return {
        questionId:     question._id,
        selectedOption: answer.selectedOption,
        isCorrect,
      };
    }).filter(Boolean); // remove nulls from invalid questionIds

    const totalScore  = quiz.questions.length;
    const percentage  = Math.round((score / totalScore) * 100);

    // Save the attempt inside the quiz document
    quiz.attempts.push({
      student:  req.user._id,
      answers:  gradedAnswers,
      score,
      totalScore,
      percentage,
    });
    await quiz.save();

    // Now we CAN reveal the correct answers since the student already submitted
    const reviewData = quiz.questions.map((q) => {
      const studentAnswer = gradedAnswers.find(
        (a) => a.questionId.toString() === q._id.toString()
      );
      return {
        question:       q.question,
        options:        q.options,
        correctAnswer:  q.correctAnswer,
        explanation:    q.explanation,
        selectedOption: studentAnswer?.selectedOption || null,
        isCorrect:      studentAnswer?.isCorrect || false,
      };
    });

    return res.status(200).json(
      new ApiResponse(200, {
        score,
        totalScore,
        percentage,
        passed: percentage >= 70,    // 70% passing threshold
        review: reviewData,
      }, `You scored ${score}/${totalScore} (${percentage}%)`)
    );
  } catch (err) {
    next(err);
  }
};

// ─── GET /quizzes/:courseId/results ──────────────────────────────
// Student views their past attempt results for a course.

const getMyResults = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ course: req.params.courseId });
    if (!quiz) return next(new ApiError(404, 'No quiz found for this course'));

    // Filter only this student's attempts
    const myAttempts = quiz.attempts
      .filter((a) => a.student.toString() === req.user._id.toString())
      .map((a) => ({
        attemptedAt: a.attemptedAt,
        score:       a.score,
        totalScore:  a.totalScore,
        percentage:  a.percentage,
        passed:      a.percentage >= 70,
      }))
      .sort((a, b) => b.attemptedAt - a.attemptedAt); // newest first

    return res.status(200).json(
      new ApiResponse(200, {
        totalAttempts: myAttempts.length,
        bestScore:     myAttempts.length > 0
          ? Math.max(...myAttempts.map((a) => a.percentage))
          : null,
        attempts: myAttempts,
      })
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  generateCourseQuiz,
  getQuiz,
  submitAttempt,
  getMyResults,
};