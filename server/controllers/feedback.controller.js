const crypto = require('crypto');
const Feedback = require('../models/Feedback.model');
const { analyzeSentiment, extractTags, detectSpam } = require('../services/sentiment.service');

// Helper: hash IP for GDPR
const hashIP = (ip) => crypto.createHash('sha256').update(ip || '').digest('hex');

// POST /api/feedback
const submitFeedback = async (req, res) => {
  try {
    const { name, email, message, category, rating } = req.body;

    if (!message || !rating) {
      return res.status(400).json({ success: false, message: 'Message and rating are required' });
    }

    const ipHash = hashIP(req.ip);

    // Spam detection: fetch last 5 messages from same IP
    const recentFeedback = await Feedback.find({ ipHash }).sort({ createdAt: -1 }).limit(5).lean();
    const recentMessages = recentFeedback.map((f) => f.message);
    const isSpam = detectSpam(message, recentMessages);

    // Sentiment analysis
    const { label: sentiment, score: sentimentScore } = analyzeSentiment(message);

    // NLP tags
    const tags = extractTags(message);

    const feedback = await Feedback.create({
      userId: req.user?.id || null,
      name: name || 'Anonymous',
      email: email || null,
      message,
      category: category || 'general',
      rating: Number(rating),
      sentiment,
      sentimentScore,
      tags,
      isSpam,
      ipHash,
    });

    // Emit real-time event (attached in server.js)
    const io = req.app.get('io');
    if (io && !isSpam) {
      io.to('admin-room').emit('feedback:new', {
        id: feedback._id,
        sentiment,
        rating: feedback.rating,
        category: feedback.category,
        createdAt: feedback.createdAt,
      });
    }

    res.status(201).json({
      success: true,
      data: {
        id: feedback._id,
        sentiment,
        sentimentScore,
        tags,
        isSpam,
      },
      message: isSpam ? 'Feedback flagged for review' : 'Feedback submitted successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/feedback
const getFeedback = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      sentiment,
      rating,
      includeSpam = false,
      search,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const filter = {};
    if (!includeSpam || includeSpam === 'false') filter.isSpam = false;
    if (category) filter.category = category;
    if (sentiment) filter.sentiment = sentiment;
    if (rating) filter.rating = Number(rating);
    if (search) filter.message = { $regex: search, $options: 'i' };

    // Non-admin users only see their own feedback
    if (req.user?.role !== 'admin') {
      filter.userId = req.user?.id || null;
    }

    const total = await Feedback.countDocuments(filter);
    const items = await Feedback.find(filter)
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      data: items,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/feedback/:id
const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }
    res.json({ success: true, message: 'Feedback deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/feedback/:id/spam  (toggle spam flag)
const toggleSpam = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }
    feedback.isSpam = !feedback.isSpam;
    await feedback.save();
    res.json({ success: true, data: { isSpam: feedback.isSpam } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { submitFeedback, getFeedback, deleteFeedback, toggleSpam };
