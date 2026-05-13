const express    = require('express');
const router     = express.Router();
const { chat }   = require('../controllers/ai.controller');
const { protect }    = require('../middleware/auth.middleware');

// Only enrolled students should ask questions ideally,
// but for simplicity any logged-in user can use the chatbot
router.post('/chat', protect, chat);

module.exports = router;