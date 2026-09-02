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

function CountrySkillChart({ data }) {
  const [selectedCountry, setSelectedCountry] = useState("India");

  const countryData = data.find(
    (item) => item.country === selectedCountry
  );

  const chartData = [
    { skill: "Python", demand: countryData.Python },
    { skill: "Java", demand: countryData.Java },
    { skill: "JavaScript", demand: countryData.JavaScript },
    { skill: "C#", demand: countryData.CSharp },
  ];

  const topSkill = chartData.reduce(
    (highest, current) =>
      current.demand > highest.demand ? current : highest
  );

  return (
    <div className="chart-card">
      <h2>Skills by Country</h2>

      <div className="country-selector">
        <label htmlFor="country">Select Country: </label>

        <select
          id="country"
          value={selectedCountry}
          onChange={(event) =>
            setSelectedCountry(event.target.value)
          }
        >
          {data.map((item) => (
            <option key={item.country} value={item.country}>
              {item.country}
            </option>
          ))}
        </select>
      </div>

      <p className="top-skill-country">
        Most Needed Skill:{" "}
        <strong>{topSkill.skill}</strong>{" "}
        ({topSkill.demand})
      </p>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />

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

export default CountrySkillChart;