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
  return (
    <div className="chart-card">
      <h2>Skills by Country</h2>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="country" />

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

export default CountrySkillChart;