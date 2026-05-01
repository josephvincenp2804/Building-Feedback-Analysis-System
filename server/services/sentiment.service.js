const Sentiment = require('sentiment');
const nlp = require('compromise');

const analyzer = new Sentiment();

/**
 * Analyzes the sentiment of a text string.
 * Returns a normalized label and score.
 *
 * Phase 2 upgrade: swap this implementation with OpenAI/VADER
 * without changing the interface.
 *
 * @param {string} text - The feedback message
 * @returns {{ label: 'positive'|'neutral'|'negative', score: number, comparative: number }}
 */
const analyzeSentiment = (text) => {
  const result = analyzer.analyze(text);
  const { score, comparative } = result;

  let label = 'neutral';
  if (comparative > 0.5) label = 'positive';
  else if (comparative < -0.5) label = 'negative';

  return {
    label,
    score: parseFloat(score.toFixed(4)),
    comparative: parseFloat(comparative.toFixed(4)),
  };
};

/**
 * Extracts relevant keyword tags from text using NLP.
 * @param {string} text
 * @returns {string[]} array of tag strings
 */
const extractTags = (text) => {
  const doc = nlp(text);
  const nouns = doc.nouns().out('array');
  const topics = doc.topics().out('array');
  const combined = [...new Set([...topics, ...nouns])];
  return combined
    .map((t) => t.toLowerCase().trim())
    .filter((t) => t.length > 2)
    .slice(0, 10);
};

/**
 * Basic spam detection heuristics.
 * @param {string} message
 * @param {string} ipHash
 * @param {string[]} recentMessages - last 5 messages from same IP
 * @returns {boolean}
 */
const detectSpam = (message, recentMessages = []) => {
  const spamKeywords = ['buy now', 'click here', 'free money', 'win prize', 'guaranteed', 'http://', 'https://'];
  const lowerMsg = message.toLowerCase();

  // Keyword check
  const hasSpamKeywords = spamKeywords.some((kw) => lowerMsg.includes(kw));

  // Duplicate message check
  const isDuplicate = recentMessages.some(
    (m) => m.toLowerCase().trim() === lowerMsg.trim()
  );

  // Very short messages (likely noise)
  const isTooShort = message.trim().length < 5;

  return hasSpamKeywords || isDuplicate || isTooShort;
};

module.exports = { analyzeSentiment, extractTags, detectSpam };
