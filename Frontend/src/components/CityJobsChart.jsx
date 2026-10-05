import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function compactRegions(regions = []) {
  const counts = new Map();
  regions.forEach((region) => {
    const parts = region.split(",").map((part) => part.trim()).filter(Boolean);
    const group = parts.at(-1) || "Not specified";
    counts.set(group, (counts.get(group) || 0) + 1);
  });
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([name, count]) => count > 1 ? `${name} (${count})` : name)
    .join(", ");
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  const detail = row.regions ? compactRegions(row.regions) : row.city || "Not specified";
  return <div className="custom-tooltip"><strong>{label}</strong><span>{row.jobs} stored jobs</span><span>{row.regions ? `${row.regions.length} locations grouped by region` : "Location"}: {detail}</span></div>;
}

export default function CityJobsChart({ data }) {
  const isCountry = Boolean(data[0]?.country);
  const title = isCountry ? "Jobs by country" : "Jobs by region";
  const labelKey = isCountry ? "country" : "city";
  if (!data.length) return <div className="chart-card"><h2>{title}</h2><p>No job snapshot available yet. Import jobs or load the labeled demo dataset.</p></div>;
  return <div className="chart-card">
    <div className="chart-header"><h2>{title}</h2><span className="live-indicator">STORED SNAPSHOT</span></div>
    <div className="chart-container soft-chart">
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 16, right: 12, left: -12, bottom: 22 }}>
          <CartesianGrid vertical={false} stroke="#d5cec0" strokeDasharray="2 8" />
          <XAxis dataKey={labelKey} axisLine={false} tickLine={false} tick={{ fill: "#706b62", fontSize: 10 }} interval={0} height={36} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#706b62", fontSize: 10 }} domain={[0, "dataMax + 4"]} allowDecimals={false} />
          <Tooltip cursor={{ stroke: "#df4b2f", strokeDasharray: "3 5" }} content={<CustomTooltip />} />
          <Line type="monotone" dataKey="jobs" stroke="#df4b2f" strokeWidth={2.5} dot={{ r: 4, fill: "#f3f0e8", stroke: "#df4b2f", strokeWidth: 2 }} activeDot={{ r: 6, fill: "#df4b2f" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>;
}
