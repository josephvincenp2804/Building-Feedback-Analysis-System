import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CATEGORY_COLORS = {
  bug: '#fbbf24',
  feature: '#7c6ef7',
  general: '#4fa3f7',
  support: '#38d9cc',
  other: '#fb923c',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: 13,
      }}>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize', marginBottom: 4 }}>{label}</div>
        <div style={{ color: 'var(--text-secondary)' }}>{payload[0].value} submissions</div>
        {payload[1] && (
          <div style={{ color: 'var(--accent-yellow)' }}>Avg rating: {payload[1].value}★</div>
        )}
      </div>
    );
  }
  return null;
};

export default function CategoryBar({ data = [] }) {
  if (!data.length) {
    return <div className="empty-state"><div className="empty-state-icon">📊</div><p>No category data yet</p></div>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="category"
          tick={{ fill: 'var(--text-muted)', fontSize: 12, textTransform: 'capitalize' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,110,247,0.05)' }} />
        <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {data.map((entry) => (
            <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category] || '#7c6ef7'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
