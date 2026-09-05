import { useEffect, useState } from "react";

import CityJobsChart from "./CityJobsChart";

function LiveCityJobs() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/locations"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch location data");
        }

        const data = await response.json();

        const formattedData = data.map((item) => ({
          city: item.location,
          jobs: item.jobs,
        }));

        setLocations(formattedData);
      } catch (error) {
        console.error(error);
        setError("Unable to load live location data.");
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  if (loading) {
    return (
      <section className="chart-card">
        <h2>Jobs by Region</h2>
        <p>Loading live market data...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="chart-card">
        <h2>Jobs by Region</h2>
        <p>{error}</p>
      </section>
    );
  }

  return <CityJobsChart data={locations} />;
}

export default LiveCityJobs;