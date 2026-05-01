const express = require('express');
const router = express.Router();
const { submitFeedback, getFeedback, deleteFeedback, toggleSpam } = require('../controllers/feedback.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { feedbackLimiter } = require('../middleware/rateLimiter');

router.post('/', feedbackLimiter, optionalAuth, submitFeedback);
router.get('/', protect, getFeedback);
router.delete('/:id', protect, requireRole('admin'), deleteFeedback);
router.patch('/:id/spam', protect, requireRole('admin'), toggleSpam);

module.exports = router;
