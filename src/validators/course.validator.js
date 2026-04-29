const { body } = require('express-validator');

const createCourseValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 120 }).withMessage('Title must be under 120 characters'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),

  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),

  body('level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Level must be beginner, intermediate, or advanced'),

  body('category')
    .optional()
    .trim(),
];

const addLessonValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Lesson title is required'),

  body('order')
    .notEmpty().withMessage('Lesson order is required')
    .isInt({ min: 1 }).withMessage('Order must be a positive integer'),

  body('duration')
    .optional()
    .isFloat({ min: 0 }).withMessage('Duration must be a positive number'),
];

module.exports = { createCourseValidator, addLessonValidator };