import { useEffect, useState } from "react";

function LiveJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://127.0.0.1:8000/api/jobs"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data = await response.json();

      setJobs(data);
    } catch (error) {
      console.error(error);
      setError("Unable to load live job data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <section className="live-jobs">
      <div className="live-jobs-header">
        <div>
          <h2>Live Job Market</h2>
          <p>Currently scraped developer jobs</p>
        </div>

        <button onClick={fetchJobs}>
          Refresh
        </button>
      </div>

      {loading && <p>Loading live jobs...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && (
        <div className="jobs-list">
          {jobs.map((job) => (
            <div className="job-row" key={job.job_url}>
              <div>
                <strong>{job.title}</strong>
                <p>{job.company}</p>
              </div>

              <span>{job.location}</span>

              <a
                href={job.job_url}
                target="_blank"
                rel="noreferrer"
              >
                View Job
              </a>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default LiveJobs;