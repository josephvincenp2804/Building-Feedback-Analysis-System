const Feedback = require('../models/Feedback.model');

/**
 * Generates a CSV string from feedback records.
 * @param {object} filter - Mongoose query filter
 * @returns {string} CSV content
 */
const generateCSV = async (filter = {}) => {
  const records = await Feedback.find({ isSpam: false, ...filter })
    .sort({ createdAt: -1 })
    .lean();

  const headers = [
    'ID',
    'Name',
    'Email',
    'Category',
    'Rating',
    'Sentiment',
    'Score',
    'Tags',
    'Message',
    'Created At',
  ];

  const escape = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = records.map((r) => [
    escape(r._id),
    escape(r.name),
    escape(r.email),
    escape(r.category),
    escape(r.rating),
    escape(r.sentiment),
    escape(r.sentimentScore),
    escape((r.tags || []).join(', ')),
    escape(r.message),
    escape(r.createdAt ? r.createdAt.toISOString() : ''),
  ]);

  const csvLines = [headers.join(','), ...rows.map((r) => r.join(','))];
  return csvLines.join('\n');
};

module.exports = { generateCSV };
