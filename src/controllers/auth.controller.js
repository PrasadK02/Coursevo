const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return next(new ApiError(409, 'Email already in use'));

    const user = await User.create({ name, email, password, role });
    const token = signToken(user._id);

    return res.status(201).json(
      new ApiResponse(201, {
        token,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      }, 'Registration successful')
    );
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return next(new ApiError(401, 'Invalid email or password'));
    }

    const token = signToken(user._id);

    return res.status(200).json(
      new ApiResponse(200, {
        token,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      }, 'Login successful')
    );
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    return res.status(200).json(new ApiResponse(200, { user: req.user }));
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe };