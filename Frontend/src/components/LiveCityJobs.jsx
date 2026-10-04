import { useEffect, useState } from "react";
import { api } from "../api.js";


import CityJobsChart from "./CityJobsChart";

function LiveCityJobs() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await api("/api/countries");

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
