import { useState } from "react";

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

function CitySkillChart({ data }) {
    const [selectedCity, setSelectedCity] = useState("Bengaluru");
    const cityData = data.find(
        (Bigcity) => Bigcity.city === selectedCity
    );

    const chartData = [
      {
        skill: "Python",
        demand: cityData.Python,
      },
      {
        skill: "Java",
        demand: cityData.Java,
      },
      {
        skill: "JavaScript",
        demand: cityData.JavaScript,
      },
      {
        skill: "C#",
        demand: cityData.CSharp,
      },
    ];

    const topskill = chartData.reduce((highest, current) => (current.demand > highest.demand ? current : highest));

  return (
    <div className="chart-card">
      <h2>Skills by City</h2>
      Most Needed Skill: {topskill.skill} ({topskill.demand})

      <div className="city-selector">
  <label htmlFor="city">Select City: </label>

  <select
    id="city"
    value={selectedCity}
    onChange={(event) => setSelectedCity(event.target.value)}
  >
    {data.map((city) => (
      <option key={city.city} value={city.city}>
        {city.city}
      </option>
    ))}
  </select>

  </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="2 3" />

            <XAxis dataKey="skill" />

            <YAxis />

            <Tooltip />

            <Legend />

            <Bar dataKey="demand" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default CitySkillChart;