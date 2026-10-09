function Shimmer({ className = "" }) {
  return <span className={`shimmer-block ${className}`.trim()} aria-hidden="true" />;
}

export function ChartLoading({ title }) {
  return (
    <section className="chart-card loading-card" aria-busy="true" aria-label={`Loading ${title}`}>
      <h2>{title}</h2>
      <div className="shimmer-chart" aria-hidden="true">
        <Shimmer className="shimmer-chart-line shimmer-chart-line-wide" />
        <Shimmer className="shimmer-chart-line shimmer-chart-line-mid" />
        <Shimmer className="shimmer-chart-line shimmer-chart-line-short" />
        <div className="shimmer-chart-bars">
          <Shimmer className="shimmer-bar shimmer-bar-one" />
          <Shimmer className="shimmer-bar shimmer-bar-two" />
          <Shimmer className="shimmer-bar shimmer-bar-three" />
          <Shimmer className="shimmer-bar shimmer-bar-four" />
          <Shimmer className="shimmer-bar shimmer-bar-five" />
        </div>
      </div>
      <p className="loading-caption">Loading stored job snapshot…</p>
    </section>
  );
}

export function JobsLoading() {
  return (
    <div className="jobs-loading" aria-busy="true" aria-label="Loading jobs">
      {["one", "two", "three"].map((item) => (
        <div className="job-row job-row-skeleton" key={item}>
          <div className="job-skeleton-copy">
            <Shimmer className="job-skeleton-title" />
            <Shimmer className="job-skeleton-company" />
          </div>
          <Shimmer className="job-skeleton-location" />
          <Shimmer className="job-skeleton-link" />
        </div>
      ))}
    </div>
  );
}

export default Shimmer;
