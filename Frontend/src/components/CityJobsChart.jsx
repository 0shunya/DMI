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
      <p>Developer Jobs: {payload[0].value}</p>
    </div>
  );
}

function CityJobsChart({ data }) {
  return (
    <div className="chart-card">
      <h2>Jobs by Region</h2>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="city" />

            <YAxis
              label={{
                value: "Number of Jobs",
                angle: -90,
                position: "insideLeft",
              }}
            />

            <Tooltip content={<CustomTooltip />} />

            <Bar
              dataKey="jobs"
              barSize={40}
              fill="#4F46E5"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default CityJobsChart;