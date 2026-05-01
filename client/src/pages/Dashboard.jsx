import { useState, useEffect, useCallback } from 'react';
import { analyticsService, feedbackService } from '../services/feedback.service';
import { io } from 'socket.io-client';
import SentimentPie from '../charts/SentimentPie';
import CategoryBar from '../charts/CategoryBar';
import TimelineChart from '../charts/TimelineChart';
import RatingHistogram from '../charts/RatingHistogram';
import FeedbackTable from '../components/FeedbackTable';
import toast from 'react-hot-toast';
import { Download, RefreshCw, MessageSquare, TrendingUp, Star, ThumbsUp, Wifi, WifiOff } from 'lucide-react';

const DATE_RANGES = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: 'All', days: null },
];

const GRANULARITIES = ['day', 'week', 'month'];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [sentimentData, setSentimentData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [ratingData, setRatingData] = useState([]);
  const [feedbackData, setFeedbackData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [granularity, setGranularity] = useState('day');
  const [feedbackFilters, setFeedbackFilters] = useState({ page: 1, limit: 10 });
  const [isLive, setIsLive] = useState(false);
  const [liveCount, setLiveCount] = useState(0);

  const buildDateFilter = (label) => {
    const range = DATE_RANGES.find((r) => r.label === label);
    if (!range?.days) return {};
    const from = new Date();
    from.setDate(from.getDate() - range.days);
    return { from: from.toISOString() };
  };

  const fetchAnalytics = useCallback(async () => {
    const params = buildDateFilter(dateRange);
    try {
      const [sum, sent, cats, time, rats] = await Promise.all([
        analyticsService.getSummary(params),
        analyticsService.getSentiment(params),
        analyticsService.getCategories(params),
        analyticsService.getTimeline({ ...params, granularity }),
        analyticsService.getRatings(params),
      ]);
      setSummary(sum.data.data);
      setSentimentData(sent.data.data);
      setCategoryData(cats.data.data);
      setTimelineData(time.data.data);
      setRatingData(rats.data.data);
    } catch (err) {
      toast.error('Failed to load analytics');
    }
  }, [dateRange, granularity]);

  const fetchFeedback = useCallback(async (filters = {}) => {
    try {
      const res = await feedbackService.getAll({ ...feedbackFilters, ...filters });
      setFeedbackData(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load feedback');
    }
  }, [feedbackFilters]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchAnalytics(), fetchFeedback()]);
    setLoading(false);
  }, [fetchAnalytics, fetchFeedback]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Socket.IO real-time connection
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000', {
      auth: { token },
    });

    socket.on('connect', () => setIsLive(true));
    socket.on('disconnect', () => setIsLive(false));

    socket.on('feedback:new', (newFeedback) => {
      setLiveCount((c) => c + 1);
      toast.custom((t) => (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          opacity: t.visible ? 1 : 0,
          transition: 'opacity 0.2s',
        }}>
          <span style={{ fontSize: 20 }}>🆕</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>New feedback received</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {newFeedback.category} · {newFeedback.sentiment} · {'★'.repeat(newFeedback.rating)}
            </div>
          </div>
        </div>
      ));
      // Refresh analytics after new feedback
      fetchAll();
    });

    return () => socket.disconnect();
  }, [fetchAll]);

  const handleExport = async () => {
    try {
      const params = buildDateFilter(dateRange);
      const res = await analyticsService.exportCSV(params);
      const url = URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `feedback-${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('CSV exported!');
    } catch {
      toast.error('Export failed');
    }
  };

  const handleFeedbackFilter = (newFilters) => {
    const merged = { ...feedbackFilters, ...newFilters, page: 1 };
    setFeedbackFilters(merged);
    fetchFeedback(merged);
  };

  const handlePageChange = (page) => {
    const merged = { ...feedbackFilters, page };
    setFeedbackFilters(merged);
    fetchFeedback(merged);
  };

  const StatCard = ({ icon, label, value, sub, gradient }) => (
    <div className="stat-card animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="stat-label">{label}</div>
          <div className="stat-value" style={{ background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {loading ? '—' : value}
          </div>
          {sub && <div className="stat-sub">{loading ? '' : sub}</div>}
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: 0.9,
        }}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="bg-mesh" />
      <div className="page-z page-content">
        <div className="container">
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Analytics Dashboard</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                <span className="live-dot" />
                {isLive ? (
                  <><Wifi size={13} style={{ color: 'var(--accent-green)' }} /> Live · {liveCount} new since load</>
                ) : (
                  <><WifiOff size={13} /> Connecting...</>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {/* Date range */}
              <div className="tabs">
                {DATE_RANGES.map((r) => (
                  <button key={r.label} className={`tab-btn ${dateRange === r.label ? 'active' : ''}`} onClick={() => setDateRange(r.label)}>
                    {r.label}
                  </button>
                ))}
              </div>
              <button className="btn btn-secondary btn-sm" onClick={fetchAll}>
                <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleExport}>
                <Download size={14} /> Export CSV
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid-4" style={{ marginBottom: 24 }}>
            <StatCard
              icon={<MessageSquare size={20} color="white" />}
              label="Total Feedback"
              value={summary?.total?.toLocaleString() ?? '0'}
              sub="All time submissions"
              gradient="linear-gradient(135deg, #7c6ef7, #4fa3f7)"
            />
            <StatCard
              icon={<Star size={20} color="white" />}
              label="Avg Rating"
              value={summary?.avgRating ? `${summary.avgRating} ★` : '—'}
              sub="Out of 5 stars"
              gradient="linear-gradient(135deg, #fbbf24, #fb923c)"
            />
            <StatCard
              icon={<ThumbsUp size={20} color="white" />}
              label="Positive Rate"
              value={summary?.positivePercent ? `${summary.positivePercent}%` : '—'}
              sub={`${summary?.positiveCount ?? 0} positive responses`}
              gradient="linear-gradient(135deg, #34d399, #38d9cc)"
            />
            <StatCard
              icon={<TrendingUp size={20} color="white" />}
              label="Avg Sentiment"
              value={summary?.avgSentimentScore ?? '—'}
              sub="Score range: -5 to +5"
              gradient="linear-gradient(135deg, #f87171, #fb923c)"
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid-2" style={{ marginBottom: 24 }}>
            <div className="chart-card">
              <div className="chart-title">Sentiment Distribution</div>
              <div className="chart-subtitle">Breakdown of feedback emotional tone</div>
              <SentimentPie data={sentimentData} />
            </div>
            <div className="chart-card">
              <div className="chart-title">Category Breakdown</div>
              <div className="chart-subtitle">Submissions grouped by type</div>
              <CategoryBar data={categoryData} />
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid-2" style={{ marginBottom: 24 }}>
            <div className="chart-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div>
                  <div className="chart-title">Feedback Timeline</div>
                  <div className="chart-subtitle">Volume over time</div>
                </div>
                <div className="tabs">
                  {GRANULARITIES.map((g) => (
                    <button key={g} className={`tab-btn ${granularity === g ? 'active' : ''}`} onClick={() => setGranularity(g)} style={{ fontSize: 11 }}>
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <TimelineChart data={timelineData} />
            </div>
            <div className="chart-card">
              <div className="chart-title">Rating Distribution</div>
              <div className="chart-subtitle">How users rated their experience</div>
              <RatingHistogram data={ratingData} />
            </div>
          </div>

          {/* Feedback Table */}
          <div className="chart-card">
            <div style={{ marginBottom: 16 }}>
              <div className="chart-title">All Feedback</div>
              <div className="chart-subtitle">Click column headers to sort</div>
            </div>
            <FeedbackTable
              data={feedbackData}
              pagination={pagination}
              onRefresh={fetchAll}
              onPageChange={handlePageChange}
              onFilterChange={handleFeedbackFilter}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
