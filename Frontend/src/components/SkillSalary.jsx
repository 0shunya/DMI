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
  const row = payload[0].payload;
  return <div className="custom-tooltip"><strong>{label}</strong><span>Salary: ₹{row.salary} LPA</span><span>Demand: {row.demand}</span></div>;
}

export default function SkillSalaryChart({ data }) {
  const chartData = data.map(({ skill, salary, demand }) => ({ skill, salary, demand }));
  if (!chartData.length) return <div className="chart-card"><h2>Salary and demand</h2><p>No illustrative data available.</p></div>;
  return <div className="chart-card">
    <div className="chart-header"><h2>Salary and demand</h2><span className="live-indicator">ILLUSTRATIVE SAMPLE</span></div>
    <div className="chart-container soft-chart">
      <ResponsiveContainer width="100%" height={310}>
        <LineChart data={chartData} margin={{ top: 16, right: 12, left: -12, bottom: 8 }}>
          <CartesianGrid vertical={false} stroke="#d5cec0" strokeDasharray="2 8" />
          <XAxis dataKey="skill" axisLine={false} tickLine={false} tick={{ fill: "#706b62", fontSize: 11 }} interval={0} />
          <YAxis yAxisId="salary" axisLine={false} tickLine={false} tick={{ fill: "#706b62", fontSize: 10 }} domain={[0, "dataMax + 2"]} />
          <YAxis yAxisId="demand" orientation="right" axisLine={false} tickLine={false} tick={{ fill: "#706b62", fontSize: 10 }} domain={[0, 100]} />
          <Tooltip cursor={{ stroke: "#bdb7aa", strokeDasharray: "3 5" }} content={<CustomTooltip />} />
          <Line yAxisId="salary" type="monotone" dataKey="salary" stroke="#171717" strokeWidth={2.5} dot={{ r: 4, fill: "#f3f0e8", stroke: "#171717", strokeWidth: 2 }} activeDot={{ r: 6, fill: "#171717" }} />
          <Line yAxisId="demand" type="monotone" dataKey="demand" stroke="#df4b2f" strokeWidth={2.5} dot={{ r: 4, fill: "#f3f0e8", stroke: "#df4b2f", strokeWidth: 2 }} activeDot={{ r: 6, fill: "#df4b2f" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
    <div className="chart-legend"><span><i className="legend-dot ink-dot" /> Salary · ₹ LPA</span><span><i className="legend-dot signal-dot-small" /> Demand score</span></div>
  </div>;
}
