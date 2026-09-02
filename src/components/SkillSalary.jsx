import {
  ComposedChart,
  Bar,
  Line,
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

  const data = payload[0].payload;

  return (
    <div className="custom-tooltip">
      <p>{label}</p>
      <p>Salary: ₹{data.salary} LPA</p>
      <p>Demand: {data.demand}</p>
    </div>
  );
}

function SkillSalaryChart({ data }) {

  const chartData = data.map((item) => ({
    skill: item.skill,
    salary: item.salary,
    demand: item.demand,
  }));

  return (
    <div className="chart-card">
      <h2>Average Salary by Skill</h2>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={chartData} barGap={10}>

            <CartesianGrid strokeDasharray="5 2" />

            <XAxis dataKey="skill" />

            <YAxis
              yAxisId="salary"
              orientation="left"
              domain={[0, "dataMax + 2"]}
              label={{
                value: "Salary (₹ LPA)",
                angle: -90,
                position: "insideLeft",
              }}
            />

            <YAxis
              yAxisId="demand"
              orientation="right"
              domain={[0, 100]}
              label={{
                value: "Demand Score",
                angle: 90,
                position: "insideRight",
              }}
            />

            <Tooltip content={<CustomTooltip />} />

            <Bar
              dataKey="salary"
              yAxisId="salary"
              barSize={30}
              fill="#FFA500"
            />

            <Line
              type="monotone"
              dataKey="demand"
              yAxisId="demand"
              stroke="#ff7300"
              strokeWidth={4}
            />

          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SkillSalaryChart;