import { useEffect, useState } from "react";

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
      <p>
        <strong>{label}</strong>
      </p>

      <p>Jobs: {payload[0].value}</p>
    </div>
  );
}

function CountrySkillChart({ data }) {
  const [selectedCountry, setSelectedCountry] = useState("");

  // Select the first available country when live data arrives
  useEffect(() => {
    if (data.length > 0) {
      setSelectedCountry((currentCountry) => {
        const stillExists = data.some(
          (item) => item.country === currentCountry
        );

        return stillExists
          ? currentCountry
          : data[0].country;
      });
    }
  }, [data]);

  const countryData = data.find(
    (item) => item.country === selectedCountry
  );

  // Wait until a country has been selected
  if (!countryData) {
    return (
      <div className="chart-card">
        <h2>Skills by Country</h2>
        <p>Loading skill data...</p>
      </div>
    );
  }

  // Dynamically get every skill available for this country
  const chartData = Object.entries(countryData)
    .filter(([key]) => key !== "country")
    .map(([skill, demand]) => ({
      skill,
      demand: Number(demand) || 0,
    }))
    .filter((item) => item.demand > 0)
    .sort((a, b) => b.demand - a.demand);

  const topSkill = chartData[0];

  return (
    <div className="chart-card">
      <h2>Skills by Country</h2>

      <div className="country-selector">
        <label htmlFor="country">
          Select Country:
        </label>

        <select
          id="country"
          value={selectedCountry}
          onChange={(event) =>
            setSelectedCountry(event.target.value)
          }
        >
          {data.map((item) => (
            <option
              key={item.country}
              value={item.country}
            >
              {item.country}
            </option>
          ))}
        </select>
      </div>

      {topSkill ? (
        <p className="top-skill-country">
          Most Needed Skill:{" "}
          <strong>{topSkill.skill}</strong>{" "}
          ({topSkill.demand})
        </p>
      ) : (
        <p className="top-skill-country">
          No skills detected for this country.
        </p>
      )}

      {chartData.length > 0 ? (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="skill" />

              <YAxis
                label={{
                  value: "Jobs",
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
      ) : (
        <p>No skill data available for this country.</p>
      )}
    </div>
  );
}

export default CountrySkillChart;