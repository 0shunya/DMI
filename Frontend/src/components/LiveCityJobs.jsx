import CityJobsChart from "./CityJobsChart";

function LiveCityJobs({ data = [], loading, error = "" }) {
  const locations = data.slice(0, 8).map((item) => ({
    country: item.country,
    jobs: item.jobs,
    regions: item.regions,
  }));

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
