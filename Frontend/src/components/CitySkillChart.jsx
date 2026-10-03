import { useState } from "react";
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

export default function CitySkillChart({ data }) {
  const [selectedRegion, setSelectedRegion] = useState("");
  const activeRegion = data.some((region) => region.location === selectedRegion) ? selectedRegion : data[0]?.location || "";
  const cityData = data.find((region) => region.location === activeRegion);
  if (!cityData) return <div className="chart-card"><h2>Skills by region</h2><p>No job snapshot available yet. Import jobs or load the labeled demo dataset.</p></div>;

  const chartData = Object.entries(cityData)
    .filter(([key]) => key !== "location")
    .map(([skill, jobs]) => ({ skill, demand: Number(jobs) || 0 }))
    .filter((item) => item.demand > 0)
    .sort((a, b) => b.demand - a.demand)
    .slice(0, 8);
  const topSkill = chartData[0];

  return <div className="chart-card">
    <div className="chart-header"><h2>Skills by region</h2><span className="live-indicator">STORED SNAPSHOT</span></div>
    <label className="chart-select">REGION<select value={activeRegion} onChange={(event) => setSelectedRegion(event.target.value)}>{data.map((region) => <option key={region.location} value={region.location}>{region.location}</option>)}</select></label>
    {topSkill && <p className="chart-highlight">Leading signal: <strong>{topSkill.skill}</strong> <span>{topSkill.demand} mentions</span></p>}
    {chartData.length ? <div className="chart-container radar-chart"><ResponsiveContainer width="100%" height={340}><RadarChart data={chartData} outerRadius="68%"><PolarGrid stroke="#d5cec0" /><PolarAngleAxis dataKey="skill" tick={{ fill: "#706b62", fontSize: 10 }} /><PolarRadiusAxis tick={{ fill: "#706b62", fontSize: 9 }} axisLine={false} /><Tooltip content={<CustomTooltip />} /><Radar dataKey="demand" stroke="#df4b2f" fill="#df4b2f" fillOpacity={0.18} strokeWidth={2} /></RadarChart></ResponsiveContainer></div> : <p>No skill data available for this region.</p>}
  </div>;
}
