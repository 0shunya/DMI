import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function CityJobsChart({ data }) {
  return (
    <div className="chart-card">
      <h2>Developer Jobs by City</h2>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="city" />

            <YAxis />

            <Tooltip />

            <Bar dataKey="jobs" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default CityJobsChart;