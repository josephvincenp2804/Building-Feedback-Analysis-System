const express = require('express');
const router = express.Router();
const {
  getSummary,
  getSentiment,
  getCategories,
  getTimeline,
  getRatings,
  exportCSV,
} = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// All analytics routes require admin role
router.use(protect, requireRole('admin'));

router.get('/summary', getSummary);
router.get('/sentiment', getSentiment);
router.get('/categories', getCategories);
router.get('/timeline', getTimeline);
router.get('/ratings', getRatings);
router.get('/export', exportCSV);

module.exports = router;
