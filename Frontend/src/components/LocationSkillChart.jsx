import CitySkillChart from "./CitySkillChart.jsx";

export default function LocationSkillChart({ city }) {
  const data = city ? [{ location: city.city, ...city }] : [];
  return <CitySkillChart data={data} />;
}
