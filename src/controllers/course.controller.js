const Course  = require('../models/Course');
const ApiError    = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// ─── GET /courses ────────────────────────────────────────────────
// Public. Returns all published courses with instructor name.
const getAllCourses = async (req, res, next) => {
  try {
    const { search, category, level, page = 1, limit = 10 } = req.query;

    const filter = { isPublished: true };

    // Full-text search on title + description (uses the text index we created)
    if (search) {
      filter.$text = { $search: search };
    }
    if (category) filter.category = category;
    if (level)    filter.level    = level;

    const skip = (Number(page) - 1) * Number(limit);

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .populate('instructor', 'name avatar') // only fetch name + avatar from User
        .select('-lessons')                    // don't send lesson content in list view
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Course.countDocuments(filter),
    ]);

    return res.status(200).json(
      new ApiResponse(200, {
        courses,
        pagination: {
          total,
          page:       Number(page),
          totalPages: Math.ceil(total / Number(limit)),
        },
      })
    );
  } catch (err) {
    next(err);
  }
};

// ─── GET /courses/:id ─────────────────────────────────────────────
// Public. Returns full course including lessons.
const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name avatar');

    if (!course) return next(new ApiError(404, 'Course not found'));

    // If course is not published, only the instructor can view it
    if (!course.isPublished) {
      const isOwner = req.user && course.instructor._id.equals(req.user._id);
      if (!isOwner) return next(new ApiError(404, 'Course not found'));
    }

    return res.status(200).json(new ApiResponse(200, { course }));
  } catch (err) {
    next(err);
  }
};

// ─── POST /courses ────────────────────────────────────────────────
// Instructor only. Creates a new course.
const createCourse = async (req, res, next) => {
  try {
    const { title, description, price, level, category } = req.body;

    const courseData = {
      title,
      description,
      price,
      level,
      category,
      instructor: req.user._id,
    };

    // If a thumbnail was uploaded via multer, req.file will have the Cloudinary URL
    if (req.file) {
      courseData.thumbnail = req.file.path;
    }

    const course = await Course.create(courseData);

    return res.status(201).json(
      new ApiResponse(201, { course }, 'Course created successfully')
    );
  } catch (err) {
    next(err);
  }
};

// ─── PUT /courses/:id ─────────────────────────────────────────────
// Instructor only (must be the course owner).
const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return next(new ApiError(404, 'Course not found'));

    // Ownership check — only the instructor who created it can edit
    if (!course.instructor.equals(req.user._id)) {
      return next(new ApiError(403, 'You are not the owner of this course'));
    }

    const allowed = ['title', 'description', 'price', 'level', 'category', 'isPublished'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        course[field] = req.body[field];
      }
    });

    if (req.file) {
      course.thumbnail = req.file.path;
    }

    await course.save();

    return res.status(200).json(
      new ApiResponse(200, { course }, 'Course updated successfully')
    );
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /courses/:id ──────────────────────────────────────────
// Instructor only (must be the course owner).
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return next(new ApiError(404, 'Course not found'));

    if (!course.instructor.equals(req.user._id)) {
      return next(new ApiError(403, 'You are not the owner of this course'));
    }

    await course.deleteOne();

    return res.status(200).json(
      new ApiResponse(200, null, 'Course deleted successfully')
    );
  } catch (err) {
    next(err);
  }
};

// ─── POST /courses/:id/lessons ────────────────────────────────────
// Instructor only. Pushes a new lesson into the course's lessons array.
const addLesson = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return next(new ApiError(404, 'Course not found'));

    if (!course.instructor.equals(req.user._id)) {
      return next(new ApiError(403, 'You are not the owner of this course'));
    }

    const { title, content, duration, order } = req.body;

    const lesson = {
      title,
      content,
      duration,
      order,
      videoUrl: req.file ? req.file.path : '',
    };

    course.lessons.push(lesson);

    // Sort lessons by order after adding
    course.lessons.sort((a, b) => a.order - b.order);

    await course.save();

    return res.status(201).json(
      new ApiResponse(201, { lesson: course.lessons.at(-1) }, 'Lesson added successfully')
    );
  } catch (err) {
    next(err);
  }
};

// ─── GET /courses/my ─────────────────────────────────────────────
// Instructor only. Returns courses they created.
const getMyCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ instructor: req.user._id })
      .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, { courses }));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  addLesson,
  getMyCourses,
};