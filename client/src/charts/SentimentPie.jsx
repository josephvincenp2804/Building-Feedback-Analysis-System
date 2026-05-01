import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = {
  positive: '#34d399',
  neutral: '#8b93b5',
  negative: '#f87171',
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    return (
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: 13,
      }}>
        <div style={{ fontWeight: 600, color: COLORS[name] || 'var(--text-primary)', textTransform: 'capitalize' }}>{name}</div>
        <div style={{ color: 'var(--text-secondary)' }}>{value} responses</div>
      </div>
    );
  }
  return null;
};

export default function SentimentPie({ data = [] }) {
  const total = data.reduce((s, d) => s + d.count, 0);

  if (!data.length) {
    return <div className="empty-state"><div className="empty-state-icon">🥧</div><p>No sentiment data yet</p></div>;
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={100}
            paddingAngle={4}
            dataKey="count"
            nameKey="sentiment"
          >
            {data.map((entry) => (
              <Cell key={entry.sentiment} fill={COLORS[entry.sentiment] || '#8b93b5'} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: 12, textTransform: 'capitalize' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8 }}>
        {data.map((d) => (
          <div key={d.sentiment} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: COLORS[d.sentiment] }}>{total ? Math.round((d.count / total) * 100) : 0}%</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{d.sentiment}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
