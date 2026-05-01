import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
        <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</div>
        {payload.map((p) => (
          <div key={p.name} style={{ color: p.color, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ textTransform: 'capitalize' }}>{p.name}</span>
            <span style={{ fontWeight: 600 }}>{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function TimelineChart({ data = [] }) {
  if (!data.length) {
    return <div className="empty-state"><div className="empty-state-icon">📈</div><p>No timeline data yet</p></div>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="date"
          tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: 12, textTransform: 'capitalize' }}>{v}</span>}
        />
        <Line
          type="monotone"
          dataKey="total"
          stroke="var(--accent-purple)"
          strokeWidth={2}
          dot={{ fill: 'var(--accent-purple)', strokeWidth: 0, r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="positive"
          stroke="var(--accent-green)"
          strokeWidth={2}
          dot={{ fill: 'var(--accent-green)', strokeWidth: 0, r: 3 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="negative"
          stroke="var(--accent-red)"
          strokeWidth={2}
          dot={{ fill: 'var(--accent-red)', strokeWidth: 0, r: 3 }}
          activeDot={{ r: 5 }}
          strokeDasharray="4 4"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
