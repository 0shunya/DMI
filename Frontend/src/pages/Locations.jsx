import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import CityJobsChart from "../components/CityJobsChart.jsx";
import CitySkillChart from "../components/CitySkillChart.jsx";
import { api } from "../api.js";

export default function Locations() {
  const [locations, setLocations] = useState([]);
  const [countries, setCountries] = useState([]);
  const [skills, setSkills] = useState({});
  const [selectedCity, setSelectedCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const snapshot = await api("/api/dashboard-snapshot");
        const { locations: locationRows, countries: countryRows, location_skills: locationSkills } = snapshot;
        if (!active) return;
        setLocations(locationRows.map((item) => ({ city: item.location, jobs: item.jobs })));
        setCountries(countryRows.slice(0, 8).map((item) => ({ country: item.country, jobs: item.jobs, regions: item.regions })));
        setSkills(locationSkills);
        setSelectedCity(locationRows[0]?.location || "");
      } catch (failure) {
        if (active) setError(failure.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const citySkillRows = Object.entries(skills).map(([location, values]) => ({ location, ...values }));
  const activeSkills = citySkillRows.find((row) => row.location === selectedCity);
  const topSkill = activeSkills ? Object.entries(activeSkills).filter(([key]) => key !== "location").sort((a, b) => b[1] - a[1])[0] : null;
  const activeJobs = locations.find((item) => item.city === selectedCity)?.jobs;

  return <><Navbar /><main className="page-shell place-page">
    <div className="page-kicker"><span>03</span> PLACE REPORT <span className="kicker-rule" /> STORED JOB SNAPSHOT</div>
    <section className="profile-hero"><div><p className="eyebrow">EXPLORE THE STORED SNAPSHOT BY PLACE</p><h1>{selectedCity || "No data"}<em>.</em></h1><p className="lede">A dynamic regional view derived from persisted job records. Counts may be incomplete or delayed.</p></div>{locations.length > 0 && <label className="field-label" htmlFor="city">SELECT A REGION<select id="city" value={selectedCity} onChange={(event) => setSelectedCity(event.target.value)}>{locations.map((item) => <option key={item.city}>{item.city}</option>)}</select></label>}</section>
    {error && <p className="form-error">Unable to load the stored location snapshot. {error}</p>}
    {loading && <p className="muted">Loading stored job snapshot…</p>}
    {!loading && !locations.length && <div className="workspace-empty"><h3>No location data yet.</h3><p>Run the ingestion worker or load the clearly labeled demo dataset.</p></div>}
    {locations.length > 0 && <>
      <section className="metric-strip">{[["STORED JOBS", activeJobs?.toLocaleString() || "—"], ["LEADING SKILL", topSkill?.[0] || "—"], ["SKILL MENTIONS", topSkill?.[1] || "—"]].map(([label, value]) => <div className="metric-cell" key={label}><span>{label}</span><strong>{value}</strong></div>)}</section>
      <section className="profile-reading"><div><span className="section-number">10</span><h2>What stands out</h2></div><p><strong>{selectedCity}</strong> has <strong>{activeJobs?.toLocaleString() || 0}</strong> stored job records. <strong>{topSkill?.[0] || "No skill"}</strong> is the strongest extracted signal in this region.</p></section>
      <section className="section-block"><div className="section-heading"><div><span className="section-number">11</span><h2>Country comparison</h2></div><p>Top countries from the current snapshot; hover to see every underlying region.</p></div><CityJobsChart data={countries} /></section>
      <section className="section-block"><div className="section-heading"><div><span className="section-number">12</span><h2>Skill mix in {selectedCity}</h2></div><p>Known skills extracted from the selected region’s stored listings.</p></div><CitySkillChart data={citySkillRows} /></section>
    </>}
  </main></>;
}
