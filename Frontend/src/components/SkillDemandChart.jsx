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
      <p>Demand Score: {payload[0].value}</p>
    </div>
  );
}

function SkillDemandChart({ data }) {
  return (
    <div className="chart-card">
      <h2>Most Demanded Skills</h2>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="5 2" />

            <XAxis dataKey="skill" />

            <YAxis
              label={{
                value: "Demand Score",
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