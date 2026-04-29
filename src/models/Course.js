const mongoose = require('mongoose');

// A lesson is embedded inside a course (not a separate collection)
// This means you get all lessons when you fetch a course — no extra query needed
const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
    },
    content: {
      type: String,         // text content or description
      default: '',
    },
    videoUrl: {
      type: String,         // Cloudinary URL
      default: '',
    },
    duration: {
      type: Number,         // in minutes
      default: 0,
    },
    order: {
      type: Number,         // lesson position e.g. 1, 2, 3
      required: true,
    },
  },
  { _id: true }             // each lesson gets its own _id (needed for progress tracking)
);

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Course price is required'],
      min: [0, 'Price cannot be negative'],
    },
    thumbnail: {
      type: String,         // Cloudinary URL
      default: '',
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',          // links to User model
      required: true,
    },
    lessons: [lessonSchema],
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    category: {
      type: String,
      trim: true,
      default: '',
    },
    isPublished: {
      type: Boolean,
      default: false,       // instructor must explicitly publish
    },
    enrollmentCount: {
      type: Number,
      default: 0,           // cached count — updated on enrollment
    },
  },
  {
    timestamps: true,       // adds createdAt and updatedAt automatically
  }
);

// Index for fast search by instructor and published status
courseSchema.index({ instructor: 1 });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ title: 'text', description: 'text' }); // enables text search

module.exports = mongoose.model('Course', courseSchema);