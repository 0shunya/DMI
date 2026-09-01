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
const highestSalary = data.reduce((highest, current) =>
  current.salary > highest ? current.salary : highest,
  0
);

  console.log("Highest Salary:", highestSalary);

  const chartData = data.map((item) => ({
  skill: item.skill,
  salaryScore: (item.salary / highestSalary) * 100,
  demand: item.demand,
}));

  console.log("Chart Data:", chartData);

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

<Bar dataKey="salaryScore" yAxisId="salary" barSize={30} />
<Bar dataKey="demand" yAxisId="demand" barSize={30} />
          </ComposedChart >
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SkillSalaryChart;