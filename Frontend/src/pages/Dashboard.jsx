import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import LiveSkillDemand from "../components/LiveSkillDemand.jsx";
import LiveCityJobs from "../components/LiveCityJobs.jsx";
import LiveCitySkill from "../components/LiveCitySkill.jsx";
import LiveCountrySkills from "../components/LiveCountrySkills.jsx";
import { api } from "../api.js";

function Dashboard() {
  const [snapshot, setSnapshot] = useState({ status: null, skills: [], locations: [], countries: [] });
  const [loading, setLoading] = useState(true);
  const [snapshotError, setSnapshotError] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");

  useEffect(() => {
    let active = true;
    const applySnapshot = (data) => {
      if (!active) return;
      setSnapshot(data);
      setSelectedCountry((current) => current || data.countries[0]?.country || "");
      setSnapshotError("");
      setLoading(false);
    };
    const loadSnapshot = async () => {
      try {
        const data = await api("/api/dashboard-snapshot", {
          staleWhileRevalidate: true,
          onFresh: applySnapshot,
        });
        applySnapshot(data);
      } catch (error) {
        console.error(error);
        if (active) {
          setSnapshotError("Unable to load the stored job snapshot.");
          setLoading(false);
        }
      }
    };
    loadSnapshot();
    return () => { active = false; };
  }, []);

  const { status, skills, locations } = snapshot;
  const topSkill = skills[0];
  const topLocation = locations[0];
  const updatedAt = status?.updated_at ? new Date(status.updated_at).toLocaleString() : "Waiting for first import";
  const glance = [
    ["STORED JOBS", status?.total ?? "—"],
    ["ILLUSTRATIVE RECORDS", status?.demo_count ?? "—"],
    ["TOP SKILL SIGNAL", topSkill?.skill ?? "—"],
    ["TOP REGION", topLocation?.location ?? "—"],
  ];

  return <>
    <Navbar />
    <main className="page-shell">
      <div className="page-kicker"><span>01</span> MARKET BRIEFING <span className="kicker-rule" /> STORED JOB SNAPSHOT</div>
      <section className="briefing-hero">
        <div><p className="eyebrow">DEVELOPER MARKET INTELLIGENCE</p><h1>Where developer opportunity is actually accumulating.</h1></div>
        <div className="hero-copy"><p>Every signal below is derived from the persisted job snapshot. Demo records are labeled; real listings may be incomplete or delayed.</p><a className="text-link" href="/jobs">Explore the job snapshot <span>↗</span></a></div>
      </section>

      <section className="signal-feature" id="signal">
        <div className="feature-label"><span className="signal-dot" /> STORED SNAPSHOT · {loading ? "CHECKING DATA" : snapshotError ? "UNAVAILABLE" : "UPDATED"}</div>
        <div className="signal-grid">
          <div className="signal-statement"><h2>{topSkill ? `${topSkill.skill} is the strongest signal in this snapshot.` : "The snapshot is waiting for its first import."}</h2><p>{topSkill ? `${topSkill.jobs} stored listings mention this skill. This is a descriptive count, not a hiring prediction.` : "Start the worker or load the clearly labeled demo dataset to explore the workflow."}</p></div>
          <div className="signal-number"><strong>{status?.total ?? "—"}</strong><span>STORED<br />JOB RECORDS</span></div>
          <div className="signal-number"><strong>{topLocation?.jobs ?? "—"}</strong><span>TOP REGION<br />{topLocation?.location ?? "—"}</span></div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading"><div><span className="section-number">02</span><h2>Snapshot at a glance</h2></div><p>Computed from the same persisted records used by the job workspace.</p></div>
        <div className="glance-grid">{glance.map(([label, value], index) => <div className="glance-item" key={label}><span className="item-index">0{index + 1}</span><span className="glance-label">{label}</span><strong>{value}</strong></div>)}</div>
      </section>

      <section className="section-block">
        <div className="section-heading"><div><span className="section-number">03</span><h2>Stored signals</h2></div><p>Skill mentions and regional volume from the same persisted listings.</p></div>
        <div className="editorial-grid charts-grid"><LiveSkillDemand data={snapshot.skills} loading={loading} error={snapshotError} /><LiveCityJobs data={snapshot.countries} loading={loading} error={snapshotError} /></div>
      </section>

      <section className="section-block">
        <div className="section-heading"><div><span className="section-number">04</span><h2>Skill mix by place</h2></div><p>Dynamic regional and country skill views from the stored job records.</p></div>
        <div className="editorial-grid charts-grid location-charts"><LiveCitySkill locations={snapshot.locations} locationSkills={snapshot.location_skills} selectedCountry={selectedCountry} loading={loading} error={snapshotError} /><LiveCountrySkills data={snapshot.country_skills} selectedCountry={selectedCountry} onCountryChange={setSelectedCountry} loading={loading} error={snapshotError} /></div>
      </section>

      <section className="method-note"><span className="eyebrow">A NOTE ON THE NUMBERS</span><p>Last snapshot: {updatedAt}. DMI reports listing counts, not truth about the entire labor market. <a href="/jobs">Inspect the listings and their sources.</a></p></section>
    </main>
  </>;
}

export default Dashboard;
