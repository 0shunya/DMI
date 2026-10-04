import { useEffect, useState } from "react";
import { api } from "../api.js";

import CountrySkillChart from "./CountrySkillChart";

function LiveCountrySkills({ selectedCountry, onCountryChange }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCountrySkills = async () => {
      try {
        const result = await api("/api/country-skills");

        const formattedData = Object.entries(result).map(
          ([country, skills]) => ({
            country,
            ...skills,
          })
        );

        setData(formattedData);
      } catch (error) {
        console.error(error);
        setError("Unable to load live country skill data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCountrySkills();
  }, []);

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
