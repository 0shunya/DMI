import { useEffect, useState } from "react";

import CitySkillChart from "./CitySkillChart";

function LiveCitySkill() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLocationSkills = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/location-skills"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch location skill data");
        }

        const result = await response.json();

        const formattedData = Object.entries(result).map(
          ([location, skills]) => ({
            location,
            ...skills,
          })
        );

        setData(formattedData);
      } catch (error) {
        console.error(error);
        setError("Unable to load live skill data.");
      } finally {
        setLoading(false);
      }
    };

    fetchLocationSkills();
  }, []);

  if (loading) {
    return (
      <section className="chart-card">
        <h2>Skills by Region</h2>
        <p>Loading live market data...</p>
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

  return <CitySkillChart data={data} />;
}

export default LiveCitySkill;