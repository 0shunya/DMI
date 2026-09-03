import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function LocationJobsChart({ data }) {
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

            <Bar
              dataKey="jobs"
              fill="#FFA500"
              barSize={45}
            />

          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default LocationJobsChart;