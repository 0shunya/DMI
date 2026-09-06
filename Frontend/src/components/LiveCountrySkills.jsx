import { useEffect, useState } from "react";

import CountrySkillChart from "./CountrySkillChart";

function LiveCountrySkills() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCountrySkills = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/country-skills"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch country skill data");
        }

        const result = await response.json();

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
        <p>Loading live market data...</p>
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

  return <CountrySkillChart data={data} />;
}

export default LiveCountrySkills;