import { useState } from 'react';
import { Trash2, Shield, ShieldOff, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { feedbackService } from '../services/feedback.service';
import toast from 'react-hot-toast';

const CATEGORIES = ['all', 'bug', 'feature', 'general', 'support', 'other'];
const SENTIMENTS = ['all', 'positive', 'neutral', 'negative'];

const StarDisplay = ({ rating }) => (
  <span style={{ color: 'var(--accent-yellow)', fontSize: '12px' }}>
    {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
  </span>
);

export default function FeedbackTable({ data, pagination, onRefresh, onPageChange, onFilterChange }) {
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSentiment, setFilterSentiment] = useState('all');

  const handleSort = (field) => {
    const newOrder = sortField === field && sortOrder === 'desc' ? 'asc' : 'desc';
    setSortField(field);
    setSortOrder(newOrder);
    onFilterChange({ sortBy: field, order: newOrder });
  };

  const handleFilter = (key, value) => {
    const newFilters = {};
    if (key === 'category') {
      setFilterCategory(value);
      newFilters.category = value === 'all' ? undefined : value;
    }
    if (key === 'sentiment') {
      setFilterSentiment(value);
      newFilters.sentiment = value === 'all' ? undefined : value;
    }
    onFilterChange(newFilters);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    onFilterChange({ search: e.target.value || undefined });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this feedback?')) return;
    try {
      await feedbackService.delete(id);
      toast.success('Feedback deleted');
      onRefresh();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleSpam = async (id) => {
    try {
      await feedbackService.toggleSpam(id);
      toast.success('Spam flag updated');
      onRefresh();
    } catch {
      toast.error('Failed to update');
    }
  };

  const SortIcon = ({ field }) =>
    sortField === field ? (
      sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
    ) : null;

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-input"
            style={{ paddingLeft: 32 }}
            placeholder="Search feedback..."
            value={search}
            onChange={handleSearch}
          />
        </div>
        <select className="form-input" style={{ width: 'auto' }} value={filterCategory} onChange={(e) => handleFilter('category', e.target.value)}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
        <select className="form-input" style={{ width: 'auto' }} value={filterSentiment} onChange={(e) => handleFilter('sentiment', e.target.value)}>
          {SENTIMENTS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        {data.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💬</div>
            <h3>No feedback found</h3>
            <p>Try adjusting your filters or wait for new submissions.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')}>Name <SortIcon field="name" /></th>
                <th onClick={() => handleSort('category')}>Category <SortIcon field="category" /></th>
                <th onClick={() => handleSort('rating')}>Rating <SortIcon field="rating" /></th>
                <th onClick={() => handleSort('sentiment')}>Sentiment <SortIcon field="sentiment" /></th>
                <th>Message</th>
                <th>Tags</th>
                <th onClick={() => handleSort('createdAt')}>Date <SortIcon field="createdAt" /></th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item._id}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {item.name || 'Anonymous'}
                    {item.isSpam && <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--accent-red)', background: 'rgba(248,113,113,0.1)', padding: '2px 6px', borderRadius: 4 }}>SPAM</span>}
                  </td>
                  <td><span className={`badge badge-${item.category}`}>{item.category}</span></td>
                  <td><StarDisplay rating={item.rating} /></td>
                  <td><span className={`badge badge-${item.sentiment}`}>{item.sentiment}</span></td>
                  <td style={{ maxWidth: 220 }} title={item.message}>{item.message}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {(item.tags || []).slice(0, 3).map((tag) => (
                        <span key={tag} style={{ fontSize: 11, background: 'var(--bg-secondary)', color: 'var(--text-muted)', padding: '2px 6px', borderRadius: 4 }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ fontSize: 12 }}>{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-sm"
                        style={{ padding: '4px 8px', background: 'rgba(251,191,36,0.1)', color: 'var(--accent-yellow)', borderRadius: 6 }}
                        onClick={() => handleSpam(item._id)}
                        title={item.isSpam ? 'Unmark spam' : 'Mark as spam'}
                      >
                        {item.isSpam ? <ShieldOff size={14} /> : <Shield size={14} />}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item._id)} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="pagination">
          <button className="page-btn" disabled={pagination.page === 1} onClick={() => onPageChange(pagination.page - 1)}>
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => i + 1).map((p) => (
            <button key={p} className={`page-btn ${pagination.page === p ? 'active' : ''}`} onClick={() => onPageChange(p)}>
              {p}
            </button>
          ))}
          <button className="page-btn" disabled={pagination.page === pagination.pages} onClick={() => onPageChange(pagination.page + 1)}>
            <ChevronRight size={14} />
          </button>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>
            {pagination.total} total
          </span>
        </div>
      )}
    </div>
  );
}
