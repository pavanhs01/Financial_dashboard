import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export function TrendLineChart({
  data,
}: {
  data: { month: string; income: number; expense: number; net: number }[];
}) {
  return (
    <div className="h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 18, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
          <XAxis dataKey="month" tick={{ fill: 'rgba(100,116,139,0.9)', fontSize: 12 }} />
          <YAxis tick={{ fill: 'rgba(100,116,139,0.9)', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              background: 'rgba(15, 23, 42, 0.92)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              color: 'white',
            }}
            labelStyle={{ color: 'rgba(226,232,240,0.9)' }}
          />
          <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="net" stroke="#6366f1" strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const PIE_COLORS = ['#6366f1', '#22c55e', '#f97316', '#06b6d4', '#a855f7', '#eab308', '#ef4444', '#14b8a6'];

export function CategoryPieChart({
  data,
}: {
  data: { category: string; income: number; expense: number; net: number }[];
}) {
  const pieData = data
    .map((c) => ({ name: c.category, value: Math.abs(c.net) }))
    .filter((d) => d.value > 0);

  return (
    <div className="h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            contentStyle={{
              background: 'rgba(15, 23, 42, 0.92)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              color: 'white',
            }}
            labelStyle={{ color: 'rgba(226,232,240,0.9)' }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={2}>
            {pieData.map((_, idx) => (
              <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
