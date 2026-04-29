const mongoose = require('mongoose');

// Each MCQ question embedded in the quiz
const questionSchema = new mongoose.Schema(
  {
    question:      { type: String, required: true },
    options:       { type: [String], required: true },   // always 4 items
    correctAnswer: { type: String, required: true },
    explanation:   { type: String, default: '' },
  },
  { _id: true }
);

// When a student submits answers, we store each answer here
const attemptSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    answers: [
      {
        questionId:    { type: mongoose.Schema.Types.ObjectId, required: true },
        selectedOption: { type: String, required: true },
        isCorrect:     { type: Boolean, required: true },
      }
    ],
    score:       { type: Number, required: true },   // number of correct answers
    totalScore:  { type: Number, required: true },   // total number of questions
    percentage:  { type: Number, required: true },   // score / totalScore * 100
    attemptedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const quizSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      unique: true,    // one quiz per course (can be regenerated)
    },
    questions: [questionSchema],
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    attempts: [attemptSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);