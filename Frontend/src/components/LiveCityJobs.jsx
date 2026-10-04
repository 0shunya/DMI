import { useEffect, useState } from "react";
import { API_URL } from "../config.js";


import CityJobsChart from "./CityJobsChart";

function LiveCityJobs() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(
            `${API_URL}/api/countries`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch location data");
        }

        const data = await response.json();

        const formattedData = data.slice(0, 8).map((item) => ({
          country: item.country,
          jobs: item.jobs,
          regions: item.regions,
        }));

        setLocations(formattedData);
      } catch (error) {
        console.error(error);
        setError("Unable to load country snapshot data.");
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  if (loading) {
    return (
      <section className="chart-card">
        <h2>Jobs by Country</h2>
        <p>Loading stored job snapshot...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="chart-card">
        <h2>Jobs by Country</h2>
        <p>{error}</p>
      </section>
    );
  }

  return <CityJobsChart data={locations} />;
}

export default LiveCityJobs;
