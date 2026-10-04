import { useEffect, useState } from "react";
import { API_URL } from "../config.js";

import CitySkillChart from "./CitySkillChart";

function LiveCitySkill({ selectedCountry }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLocationSkills = async () => {
      try {
        const [skillsResponse, locationsResponse] = await Promise.all([
          fetch(`${API_URL}/api/location-skills`),
          fetch(`${API_URL}/api/locations`),
        ]);
        if (!skillsResponse.ok || !locationsResponse.ok) throw new Error("Failed to fetch location skill data");
        const [result, locationRows] = await Promise.all([skillsResponse.json(), locationsResponse.json()]);
        const countryByLocation = new Map(locationRows.map((item) => [item.location, item.country]));

        const formattedData = Object.entries(result).map(
          ([location, skills]) => ({
            location,
            country: countryByLocation.get(location) || "Not specified",
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
