import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function SkillDemandChart({ data }) {
  return (
    <div className="chart-card">
      <h2>Most Demanded Skills</h2>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="5 2" />

            <XAxis dataKey="skill" />

            <YAxis />

            <Tooltip />

            <Bar dataKey="demand" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SkillDemandChart;