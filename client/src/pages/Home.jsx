import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { feedbackService } from '../services/feedback.service';
import toast from 'react-hot-toast';
import { Send, CheckCircle, Star, Sparkles } from 'lucide-react';

const schema = z.object({
  name: z.string().max(60).optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  message: z.string().min(5, 'Please write at least 5 characters').max(2000),
  category: z.enum(['bug', 'feature', 'general', 'support', 'other']),
  rating: z.number().min(1).max(5),
});

const CATEGORIES = [
  { value: 'bug', label: '🐛 Bug Report', color: 'var(--accent-yellow)' },
  { value: 'feature', label: '✨ Feature Request', color: 'var(--accent-purple)' },
  { value: 'general', label: '💬 General', color: 'var(--accent-blue)' },
  { value: 'support', label: '🛟 Support', color: 'var(--accent-cyan)' },
  { value: 'other', label: '📌 Other', color: 'var(--accent-orange)' },
];

const SENTIMENT_COLORS = { positive: 'var(--accent-green)', neutral: 'var(--text-secondary)', negative: 'var(--accent-red)' };
const SENTIMENT_EMOJIS = { positive: '😊', neutral: '😐', negative: '😞' };

export default function Home() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(null); // holds sentiment result
  const [charCount, setCharCount] = useState(0);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { category: 'general', rating: 0 },
  });

  const selectedCategory = watch('category');

  const onSubmit = async (data) => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    try {
      const res = await feedbackService.submit({ ...data, rating });
      setSubmitted(res.data.data);
      toast.success('Feedback submitted! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    }
  };

  const handleReset = () => {
    setSubmitted(null);
    setRating(0);
    setCharCount(0);
    reset();
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="bg-mesh" />
        <div className="page-z animate-fade-in-up" style={{ textAlign: 'center', maxWidth: 480 }}>
          <div className="glass-card" style={{ padding: '48px 40px' }}>
            <div style={{
              width: 72, height: 72, margin: '0 auto 20px',
              background: 'linear-gradient(135deg, var(--accent-green), var(--accent-cyan))',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckCircle size={36} color="white" />
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Thank You!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14 }}>Your feedback has been received and analyzed.</p>

            {/* Sentiment result */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '20px 24px',
              marginBottom: 24,
            }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sentiment Analysis</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <span style={{ fontSize: 36 }}>{SENTIMENT_EMOJIS[submitted.sentiment]}</span>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: SENTIMENT_COLORS[submitted.sentiment], textTransform: 'capitalize' }}>
                    {submitted.sentiment}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Score: {submitted.sentimentScore}</div>
                </div>
              </div>
              {submitted.tags?.length > 0 && (
                <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {submitted.tags.map((tag) => (
                    <span key={tag} style={{ fontSize: 11, background: 'var(--bg-card)', color: 'var(--accent-purple)', padding: '3px 8px', borderRadius: 6, border: '1px solid var(--border)' }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button onClick={handleReset} className="btn btn-primary btn-lg">
              <Sparkles size={16} /> Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="bg-mesh" />
      <div className="page-z animate-fade-in-up" style={{ width: '100%', maxWidth: 560 }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(124,110,247,0.12)',
            border: '1px solid rgba(124,110,247,0.25)',
            borderRadius: 100, padding: '4px 14px',
            fontSize: 12, color: 'var(--accent-purple)', fontWeight: 600,
            marginBottom: 16,
          }}>
            <Sparkles size={12} /> Powered by AI Sentiment Analysis
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.2, marginBottom: 10 }}>
            Share Your{' '}
            <span style={{ background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Feedback
            </span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Help us improve with your honest thoughts. Every opinion matters.</p>
        </div>

        {/* Form */}
        <div className="glass-card" style={{ padding: '36px 32px' }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Name & Email */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Name (optional)</label>
                <input {...register('name')} className="form-input" placeholder="Your name" />
              </div>
              <div className="form-group">
                <label className="form-label">Email (optional)</label>
                <input {...register('email')} type="email" className={`form-input ${errors.email ? 'error' : ''}`} placeholder="you@example.com" />
                {errors.email && <span className="form-error">{errors.email.message}</span>}
              </div>
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label">Category</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setValue('category', cat.value)}
                    style={{
                      padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                      border: `1px solid ${selectedCategory === cat.value ? cat.color : 'var(--border)'}`,
                      background: selectedCategory === cat.value ? `${cat.color}18` : 'var(--bg-secondary)',
                      color: selectedCategory === cat.value ? cat.color : 'var(--text-muted)',
                      transition: 'all 0.15s',
                      cursor: 'pointer',
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div className="form-group">
              <label className="form-label">Rating</label>
              <div className="star-rating" style={{ gap: 8 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="star"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => { setRating(star); setValue('rating', star); }}
                    style={{ fontSize: 28, background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <span className={star <= (hoverRating || rating) ? 'filled' : 'empty'} style={{
                      color: star <= (hoverRating || rating) ? 'var(--accent-yellow)' : 'var(--text-muted)',
                      transition: 'color 0.1s',
                    }}>★</span>
                  </button>
                ))}
                {rating > 0 && (
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 4, alignSelf: 'center' }}>
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                  </span>
                )}
              </div>
            </div>

            {/* Message */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Your Feedback</span>
                <span style={{ color: charCount > 1800 ? 'var(--accent-red)' : 'var(--text-muted)', fontWeight: 400 }}>{charCount}/2000</span>
              </label>
              <textarea
                {...register('message')}
                className={`form-input ${errors.message ? 'error' : ''}`}
                placeholder="Tell us what's on your mind. Be as detailed as you'd like..."
                rows={5}
                style={{ resize: 'vertical', minHeight: 120 }}
                onChange={(e) => setCharCount(e.target.value.length)}
              />
              {errors.message && <span className="form-error">{errors.message.message}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={isSubmitting}>
              {isSubmitting
                ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Analyzing sentiment...</>
                : <><Send size={16} /> Submit Feedback</>
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
