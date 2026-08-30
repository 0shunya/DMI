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
        (city) => city.city === selectedCity
    );
  return (
    <div className="chart-card">
      <h2>Skills by City</h2>

      <div className="city-selector">
  <label htmlFor="city">Select City: </label>

  

  </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="city" />

            <YAxis />

            <Tooltip />

            <Legend />

            <Bar dataKey="Python" />
            <Bar dataKey="Java" />
            <Bar dataKey="JavaScript" />
            <Bar dataKey="CSharp" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default CitySkillChart;