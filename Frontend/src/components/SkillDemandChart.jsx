import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="custom-tooltip">
      <p><strong>{label}</strong></p>
      <p>Jobs: {payload[0].value}</p>
    </div>
  );
}

function SkillDemandChart({ data }) {
  return (
    <div className="chart-card">
      <div className="chart-header">
  <h2>Most Demanded Skills</h2>

  <span className="live-indicator">
    <span className="live-dot"></span>
    LIVE
  </span>
</div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="5 2" />

            <XAxis dataKey="skill" />

            <YAxis
              label={{
                value: "Jobs Mentioning Skill",
                angle: -90,
                position: "insideLeft",
              }}
            />

            <Tooltip content={<CustomTooltip />} />

            <Bar
              dataKey="demand"
              barSize={40}
              fill="#4F46E5"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SkillDemandChart;