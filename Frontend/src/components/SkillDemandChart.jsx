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
  return <div className="custom-tooltip"><strong>{label}</strong><span>{payload[0].value} job mentions</span></div>;
}

export default function SkillDemandChart({ data }) {
  if (!data.length) {
    return <div className="chart-card"><h2>Skill demand</h2><p>No job snapshot available yet.</p></div>;
  }
  return <div className="chart-card">
    <div className="chart-header"><h2>Skill demand</h2><span className="live-indicator">STORED SNAPSHOT</span></div>
    <div className="chart-container soft-chart">
      <ResponsiveContainer width="100%" height={310}>
        <LineChart data={data} margin={{ top: 16, right: 12, left: -12, bottom: 8 }}>
          <CartesianGrid vertical={false} stroke="#d5cec0" strokeDasharray="2 8" />
          <XAxis dataKey="skill" axisLine={false} tickLine={false} tick={{ fill: "#706b62", fontSize: 11 }} interval={0} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#706b62", fontSize: 10 }} allowDecimals={false} />
          <Tooltip cursor={{ stroke: "#df4b2f", strokeDasharray: "3 5" }} content={<CustomTooltip />} />
          <Line type="monotone" dataKey="demand" stroke="#df4b2f" strokeWidth={2.5} dot={{ r: 4, fill: "#f3f0e8", stroke: "#df4b2f", strokeWidth: 2 }} activeDot={{ r: 6, fill: "#df4b2f" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>;
}
