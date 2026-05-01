const analyticsService = require('../services/analytics.service');
const { generateCSV } = require('../services/export.service');

// Shared date filter builder
const buildDateFilter = (from, to) => {
  const filter = {};
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }
  return filter;
};

// GET /api/analytics/summary
const getSummary = async (req, res) => {
  try {
    const { from, to } = req.query;
    const data = await analyticsService.getSummary(buildDateFilter(from, to));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/analytics/sentiment
const getSentiment = async (req, res) => {
  try {
    const { from, to } = req.query;
    const data = await analyticsService.getSentimentDistribution(buildDateFilter(from, to));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/analytics/categories
const getCategories = async (req, res) => {
  try {
    const { from, to } = req.query;
    const data = await analyticsService.getCategoryBreakdown(buildDateFilter(from, to));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/analytics/timeline?granularity=day|week|month
const getTimeline = async (req, res) => {
  try {
    const { from, to, granularity = 'day' } = req.query;
    const data = await analyticsService.getTimeline(buildDateFilter(from, to), granularity);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/analytics/ratings
const getRatings = async (req, res) => {
  try {
    const { from, to } = req.query;
    const data = await analyticsService.getRatingHistogram(buildDateFilter(from, to));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/analytics/export
const exportCSV = async (req, res) => {
  try {
    const { from, to, category, sentiment } = req.query;
    const filter = buildDateFilter(from, to);
    if (category) filter.category = category;
    if (sentiment) filter.sentiment = sentiment;

    const csv = await generateCSV(filter);
    const filename = `feedback-export-${Date.now()}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getSummary, getSentiment, getCategories, getTimeline, getRatings, exportCSV };
