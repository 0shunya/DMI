import {useState } from "react";

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
    const [selectedCountry, setSelectedCountry] = useState("India");
    const countryData = data.find(
        (item) => item.country === selectedCountry
    );
    const chartData = [
  {
    skill: "Python",
    demand: countryData.Python,
  },
  {
    skill: "Java",
    demand: countryData.Java,
  },
  {
    skill: "JavaScript",
    demand: countryData.JavaScript,
  },
  {
    skill: "C#",
    demand: countryData.CSharp,
  },
];

const topSkill = chartData.reduce((highest, current) => current.demand > highest.demand ? current:highest );

  return (
    <div className="chart-card">
      <h2>Skills by Country</h2>

      <div className="top-skill">
      <strong>Most Needed Skill:</strong>{" "}
      {topSkill.skill} ({topSkill.demand})
    </div>

      <div className="country-selector">
        <label htmlFor="country" >Select Country</label>
     

      <select 
      id="country"
      value={selectedCountry}
      onChange={(event) => setSelectedCountry(event.target.value)}
      >
        {data.map((item) => (
          <option key={item.country} value={item.country}>
            {item.country}
          </option>
        ))}

      </select>
   </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="skill" />

            <YAxis />

            <Tooltip />

            <Legend />

            <Bar dataKey="demand" fill="#FFA500" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default CountrySkillChart;