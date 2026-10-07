import CitySkillChart from "./CitySkillChart";

function LiveCitySkill({ locationSkills = {}, locations = [], selectedCountry, loading, error = "" }) {
  const countryByLocation = new Map(locations.map((item) => [item.location, item.country]));
  const data = Object.entries(locationSkills).map(([location, skills]) => ({
    location,
    country: countryByLocation.get(location) || "Not specified",
    ...skills,
  }));

  if (loading) {
    return (
      <section className="chart-card">
        <h2>Skills by Region</h2>
        <p>Loading stored job snapshot...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="chart-card">
        <h2>Skills by Region</h2>
        <p>{error}</p>
      </section>
    );
  }

  const visibleData = selectedCountry ? data.filter((item) => item.country === selectedCountry) : data;
  return <CitySkillChart data={visibleData} />;
}

export default LiveCitySkill;
