import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return <div className="custom-tooltip"><strong>{label}</strong><span>{payload[0].value} stored jobs</span></div>;
}

export default function CityJobsChart({ data }) {
  if (!data.length) return <div className="chart-card"><h2>Jobs by region</h2><p>No job snapshot available yet. Import jobs or load the labeled demo dataset.</p></div>;
  return <div className="chart-card">
    <div className="chart-header"><h2>Jobs by region</h2><span className="live-indicator">STORED SNAPSHOT</span></div>
    <div className="chart-container soft-chart">
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 16, right: 12, left: -12, bottom: 22 }}>
          <CartesianGrid vertical={false} stroke="#d5cec0" strokeDasharray="2 8" />
          <XAxis dataKey="city" axisLine={false} tickLine={false} tick={{ fill: "#706b62", fontSize: 10 }} angle={-24} textAnchor="end" interval={0} height={52} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#706b62", fontSize: 10 }} allowDecimals={false} />
          <Tooltip cursor={{ stroke: "#df4b2f", strokeDasharray: "3 5" }} content={<CustomTooltip />} />
          <Line type="monotone" dataKey="jobs" stroke="#df4b2f" strokeWidth={2.5} dot={{ r: 4, fill: "#f3f0e8", stroke: "#df4b2f", strokeWidth: 2 }} activeDot={{ r: 6, fill: "#df4b2f" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>;
}
