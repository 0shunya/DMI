import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function CountrySkillChart({ data }) {
  return (
    <div className="chart-card">
      <h2>Skills by Country</h2>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="country" />

            <YAxis />

            <Tooltip />

            <Legend />

            <Bar dataKey="Python" />
            <Bar dataKey="Java" />
            <Bar dataKey="JavaScript" />
            <Bar dataKey="CSharp" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default CountrySkillChart;