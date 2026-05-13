require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const logger     = require('./utils/logger');
const errorHandler     = require('./middleware/error.middleware');
const authRoutes       = require('./routes/auth.routes');
const courseRoutes     = require('./routes/course.routes');
const enrollmentRoutes = require('./routes/enrollment.routes');
const aiRoutes         = require('./routes/ai.routes');    // NEW
const quizRoutes       = require('./routes/quiz.routes');  // NEW

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

app.use('/api/v1/auth',        authRoutes);
app.use('/api/v1/courses',     courseRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/ai',          aiRoutes);     
app.use('/api/v1/quizzes',     quizRoutes);   

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

module.exports = app;