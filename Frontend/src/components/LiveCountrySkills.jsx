import CountrySkillChart from "./CountrySkillChart";

function LiveCountrySkills({ data: result = {}, selectedCountry, onCountryChange, loading, error = "" }) {
  const data = Object.entries(result).map(([country, skills]) => ({ country, ...skills }));

  if (loading) {
    return (
      <section className="chart-card">
        <h2>Skills by Country</h2>
        <p>Loading stored job snapshot...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="chart-card">
        <h2>Skills by Country</h2>
        <p>{error}</p>
      </section>
    );
  }

  return <CountrySkillChart data={data} selectedCountry={selectedCountry} onCountryChange={onCountryChange} />;
}

export default LiveCountrySkills;
