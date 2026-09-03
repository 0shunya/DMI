import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function LocationSkillChart({ city }) {
  const data = [
    {
      skill: "Python",
      demand: city.Python,
    },
    {
      skill: "Java",
      demand: city.Java,
    },
    {
      skill: "JavaScript",
      demand: city.JavaScript,
    },
    {
      skill: "C#",
      demand: city.CSharp,
    },
  ];

  return (
    <div className="chart-card">
      <h2>{city.city} — Skill Demand</h2>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="skill" />

            <YAxis domain={[0, 100]} />

            <Tooltip />

            <Bar
              dataKey="demand"
              fill="#FFA500"
              barSize={45}
            />

          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default LocationSkillChart;