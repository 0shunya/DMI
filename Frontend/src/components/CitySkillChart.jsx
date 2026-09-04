import { useState } from "react";

import {
  BarChart,
  Bar,
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

  return (
    <div className="custom-tooltip">
      <p><strong>{label}</strong></p>
      <p>Demand Score: {payload[0].value}</p>
    </div>
  );
}

function CitySkillChart({ data }) {
  const [selectedCity, setSelectedCity] = useState("Bengaluru");

  const cityData = data.find(
    (city) => city.city === selectedCity
  );

  const chartData = [
    { skill: "Python", demand: cityData.Python },
    { skill: "Java", demand: cityData.Java },
    { skill: "JavaScript", demand: cityData.JavaScript },
    { skill: "C#", demand: cityData.CSharp },
  ];

  const topSkill = chartData.reduce(
    (highest, current) =>
      current.demand > highest.demand ? current : highest
  );

  return (
    <div className="chart-card">
      <h2>Skills by City</h2>

      <div className="city-selector">
        <label htmlFor="city">Select City: </label>

        <select
          id="city"
          value={selectedCity}
          onChange={(event) =>
            setSelectedCity(event.target.value)
          }
        >
          {data.map((city) => (
            <option key={city.city} value={city.city}>
              {city.city}
            </option>
          ))}
        </select>
      </div>

      <p className="top-skill-city">
        Most Needed Skill:{" "}
        <strong>{topSkill.skill}</strong>{" "}
        ({topSkill.demand})
      </p>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="2 3" />

            <XAxis dataKey="skill" />

            <YAxis
              label={{
                value: "Demand Score",
                angle: -90,
                position: "insideLeft",
              }}
            />

            <Tooltip content={<CustomTooltip />} />

            <Bar
              dataKey="demand"
              barSize={40}
              fill="#FFA500"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default CitySkillChart;