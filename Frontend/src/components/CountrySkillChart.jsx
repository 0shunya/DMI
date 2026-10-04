import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return <div className="custom-tooltip"><strong>{payload[0].payload.skill}</strong><span>{payload[0].value} job mentions</span></div>;
}

export default function CountrySkillChart({ data, selectedCountry = "", onCountryChange }) {
  const activeCountry = data.some((item) => item.country === selectedCountry) ? selectedCountry : data[0]?.country || "";
  const countryData = data.find((item) => item.country === activeCountry);
  if (!countryData) return <div className="chart-card"><h2>Skills by country</h2><p>No job snapshot available yet. Import jobs or load the labeled demo dataset.</p></div>;

  const chartData = Object.entries(countryData)
    .filter(([key]) => key !== "country")
    .map(([skill, demand]) => ({ skill, demand: Number(demand) || 0 }))
    .filter((item) => item.demand > 0)
    .sort((a, b) => b.demand - a.demand)
    .slice(0, 8);
  const topSkill = chartData[0];

  return <div className="chart-card">
    <div className="chart-header"><h2>Skills by country</h2><span className="live-indicator">STORED SNAPSHOT</span></div>
    <label className="chart-select">COUNTRY<select value={activeCountry} onChange={(event) => onCountryChange?.(event.target.value)}>{data.map((item) => <option key={item.country} value={item.country}>{item.country}</option>)}</select></label>
    {topSkill && <p className="chart-highlight">Leading signal: <strong>{topSkill.skill}</strong> <span>{topSkill.demand} mentions</span></p>}
    {chartData.length ? <div className="chart-container radar-chart"><ResponsiveContainer width="100%" height={340}><RadarChart data={chartData} outerRadius="68%"><PolarGrid stroke="#d5cec0" /><PolarAngleAxis dataKey="skill" tick={{ fill: "#706b62", fontSize: 10 }} /><PolarRadiusAxis tick={{ fill: "#706b62", fontSize: 9 }} axisLine={false} /><Tooltip content={<CustomTooltip />} /><Radar dataKey="demand" stroke="#171717" fill="#171717" fillOpacity={0.12} strokeWidth={2} /></RadarChart></ResponsiveContainer></div> : <p>No skill data available for this country.</p>}
  </div>;
}
