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

function CitySkillChart({ data }) {
  const [selectedRegion, setSelectedRegion] = useState("");

  // Select the first region when live data arrives
  useEffect(() => {
    if (data.length > 0) {
      setSelectedRegion((currentRegion) => {
        const exists = data.some(
          (region) => region.location === currentRegion
        );

        return exists
          ? currentRegion
          : data[0].location;
      });
    }
  }, [data]);

  // Find the selected region
  const cityData = data.find(
    (region) => region.location === selectedRegion
  );

  if (!cityData) {
    return (
      <div className="chart-card">
        <h2>Skills by Region</h2>
        <p>Loading skill data...</p>
      </div>
    );
  }

  /*
   * cityData looks like:
   *
   * {
   *   location: "KA, IN",
   *   Python: 2,
   *   Java: 1,
   *   JavaScript: 2,
   *   React: 2
   * }
   *
   * So remove "location" and turn
   * everything else into chart data.
   */

  const chartData = Object.entries(cityData)
    .filter(([key]) => key !== "location")
    .map(([skill, jobs]) => ({
      skill,
      demand: Number(jobs) || 0,
    }))
    .filter((item) => item.demand > 0)
    .sort((a, b) => b.demand - a.demand);

  const topSkill = chartData[0];

  return (
    <div className="chart-card">
      <h2>Skills by Region</h2>

      <div className="city-selector">
        <label htmlFor="region">
          Select Region:
        </label>

        <select
          id="region"
          value={selectedRegion}
          onChange={(event) =>
            setSelectedRegion(event.target.value)
          }
        >
          {data.map((region) => (
            <option
              key={region.location}
              value={region.location}
            >
              {region.location}
            </option>
          ))}
        </select>
      </div>

      {topSkill ? (
        <p className="top-skill-city">
          Most Needed Skill:{" "}
          <strong>{topSkill.skill}</strong>{" "}
          ({topSkill.demand})
        </p>
      ) : (
        <p className="top-skill-city">
          No skills detected for this region.
        </p>
      )}

      {chartData.length > 0 ? (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="2 3" />

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
        <p>No skill data available for this region.</p>
      )}
    </div>
  );
}

export default CitySkillChart;