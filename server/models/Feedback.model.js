const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    name: {
      type: String,
      trim: true,
      maxlength: 60,
      default: 'Anonymous',
    },
    email: {
      type: String,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
      default: null,
    },
    message: {
      type: String,
      required: [true, 'Feedback message is required'],
      trim: true,
      minlength: [5, 'Message too short'],
      maxlength: [2000, 'Message too long'],
    },
    category: {
      type: String,
      enum: ['bug', 'feature', 'general', 'support', 'other'],
      default: 'general',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Rating is required'],
    },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      default: 'neutral',
    },
    sentimentScore: {
      type: Number,
      default: 0,
    },
    tags: [{ type: String }],
    isSpam: {
      type: Boolean,
      default: false,
    },
    ipHash: {
      type: String,
      select: false,
    },
  },
  { timestamps: true }
);

// Indexes for performance
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ category: 1 });
feedbackSchema.index({ sentiment: 1 });
feedbackSchema.index({ isSpam: 1 });
feedbackSchema.index({ rating: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
