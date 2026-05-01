import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const STAR_COLORS = {
  1: '#f87171',
  2: '#fb923c',
  3: '#fbbf24',
  4: '#34d399',
  5: '#7c6ef7',
};

const ALL_RATINGS = [1, 2, 3, 4, 5];

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
        <div style={{ fontWeight: 600, color: 'var(--accent-yellow)', marginBottom: 2 }}>{'★'.repeat(label)}</div>
        <div style={{ color: 'var(--text-secondary)' }}>{payload[0].value} reviews</div>
      </div>
    );
  }
  return null;
};

export default function RatingHistogram({ data = [] }) {
  // Ensure all 5 ratings exist in data
  const enriched = ALL_RATINGS.map((r) => {
    const found = data.find((d) => d.rating === r);
    return { rating: r, count: found?.count || 0 };
  });

  const total = enriched.reduce((s, d) => s + d.count, 0);

  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={enriched} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="rating"
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${'★'.repeat(v)}`}
          />
          <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,110,247,0.05)' }} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {enriched.map((entry) => (
              <Cell key={entry.rating} fill={STAR_COLORS[entry.rating]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {total > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12 }}>
          {enriched.map((d) => (
            <div key={d.rating} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: STAR_COLORS[d.rating] }}>
                {total ? Math.round((d.count / total) * 100) : 0}%
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{'★'.repeat(d.rating)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
