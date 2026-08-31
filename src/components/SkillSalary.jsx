import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function SkillSalaryChart({ data }) {
  return (
    <div className="chart-card">
      <h2>Average Salary by Skill</h2>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart  data={data}>
            <CartesianGrid strokeDasharray="5 2" />

            <XAxis dataKey="skill" />

            <YAxis 
              yAxisId="salary" 
              label={{
                value: "Salary (₹ LPA)",
                angle: -90,
                position: "insideLeft",
              }} />
              
             <YAxis
              yAxisId="demand"
              orientation="right"
              label={{
                value: "Demand Score",
                angle: 90,
                position: "insideRight",
              }}
            />

            <Tooltip />

            <Bar dataKey="salary" yAxisId="salary" />
            <Bar dataKey="demand" yAxisId="demand" />
          </ComposedChart >
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SkillSalaryChart;