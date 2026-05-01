const Feedback = require('../models/Feedback.model');

/**
 * Computes high-level KPIs across all non-spam feedback.
 */
const getSummary = async (filter = {}) => {
  const baseMatch = { isSpam: false, ...filter };

  const [totals] = await Feedback.aggregate([
    { $match: baseMatch },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        avgRating: { $avg: '$rating' },
        avgSentimentScore: { $avg: '$sentimentScore' },
        positiveCount: {
          $sum: { $cond: [{ $eq: ['$sentiment', 'positive'] }, 1, 0] },
        },
        neutralCount: {
          $sum: { $cond: [{ $eq: ['$sentiment', 'neutral'] }, 1, 0] },
        },
        negativeCount: {
          $sum: { $cond: [{ $eq: ['$sentiment', 'negative'] }, 1, 0] },
        },
      },
    },
  ]);

  if (!totals) {
    return {
      total: 0,
      avgRating: 0,
      avgSentimentScore: 0,
      positiveCount: 0,
      neutralCount: 0,
      negativeCount: 0,
      positivePercent: 0,
    };
  }

  return {
    ...totals,
    avgRating: parseFloat(totals.avgRating.toFixed(2)),
    avgSentimentScore: parseFloat(totals.avgSentimentScore.toFixed(2)),
    positivePercent: parseFloat(
      ((totals.positiveCount / totals.total) * 100).toFixed(1)
    ),
  };
};

/**
 * Returns sentiment distribution counts.
 */
const getSentimentDistribution = async (filter = {}) => {
  return Feedback.aggregate([
    { $match: { isSpam: false, ...filter } },
    { $group: { _id: '$sentiment', count: { $sum: 1 } } },
    { $project: { sentiment: '$_id', count: 1, _id: 0 } },
  ]);
};

/**
 * Returns per-category breakdown with avg rating and sentiment.
 */
const getCategoryBreakdown = async (filter = {}) => {
  return Feedback.aggregate([
    { $match: { isSpam: false, ...filter } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
    {
      $project: {
        category: '$_id',
        count: 1,
        avgRating: { $round: ['$avgRating', 2] },
        _id: 0,
      },
    },
    { $sort: { count: -1 } },
  ]);
};

/**
 * Returns time-series data grouped by day (or week).
 * @param {'day'|'week'|'month'} granularity
 */
const getTimeline = async (filter = {}, granularity = 'day') => {
  const dateFormat = {
    day: '%Y-%m-%d',
    week: '%Y-W%V',
    month: '%Y-%m',
  }[granularity];

  return Feedback.aggregate([
    { $match: { isSpam: false, ...filter } },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
        total: { $sum: 1 },
        positive: {
          $sum: { $cond: [{ $eq: ['$sentiment', 'positive'] }, 1, 0] },
        },
        negative: {
          $sum: { $cond: [{ $eq: ['$sentiment', 'negative'] }, 1, 0] },
        },
        avgRating: { $avg: '$rating' },
      },
    },
    {
      $project: {
        date: '$_id',
        total: 1,
        positive: 1,
        negative: 1,
        avgRating: { $round: ['$avgRating', 2] },
        _id: 0,
      },
    },
    { $sort: { date: 1 } },
  ]);
};

/**
 * Returns rating histogram (1-5 star distribution).
 */
const getRatingHistogram = async (filter = {}) => {
  return Feedback.aggregate([
    { $match: { isSpam: false, ...filter } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $project: { rating: '$_id', count: 1, _id: 0 } },
    { $sort: { rating: 1 } },
  ]);
};

module.exports = {
  getSummary,
  getSentimentDistribution,
  getCategoryBreakdown,
  getTimeline,
  getRatingHistogram,
};
