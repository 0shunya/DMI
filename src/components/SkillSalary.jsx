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
const highestSalary = data.reduce((highest, current) =>
  current.salary > highest ? current.salary : highest,
  0
);

const highestSalarySkill = data.find(
  (item) => item.salary === highestSalary
);

  console.log("Highest Salary:", highestSalary);

  console.log("Highest Salary Skill:", highestSalarySkill);

const chartData = data.map((item) => ({
  skill: item.skill,
  salary: item.salary,
  salaryScore: (item.salary / highestSalary) * 100,
  demand: item.demand,
  opportunityScore:
    ((item.salary / highestSalary) * 100 * 0.5) +
    (item.demand * 0.5),
}));

const bestOpportunity = chartData.reduce(
  (best, current) =>
    current.opportunityScore > best.opportunityScore
      ? current
      : best
);

console.log("Best Opportunity:", bestOpportunity);

  console.log("Chart Data:", chartData);

  console.log("Opportunity Scores:", chartData.map((item) => ({
    skill: item.skill,
    score: item.opportunityScore,
  })));

  return (
    <div className="chart-card">
      <h2>Average Salary by Skill</h2>

    <div className="best-opportunity">
      <strong>Best Opportunity:</strong>{" "}
      {bestOpportunity.skill} ({bestOpportunity.opportunityScore.toFixed(1)})

      <p>
        Salary: ₹{bestOpportunity.salary} LPA | Demand: {bestOpportunity.demand}
      </p>
    </div>

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

            <Tooltip content={<CustomTooltip />} />

          <Bar dataKey="salaryScore" yAxisId="salary" barSize={30} fill="#FFA500" />
          {/* <Bar dataKey="demand" yAxisId="demand" barSize={30} /> */}

            <Line
              type="monotone"
              dataKey="demand"
              yAxisId="demand"
              stroke="#ff7300"
              strokeWidth={4}
            />

          </ComposedChart >
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SkillSalaryChart;