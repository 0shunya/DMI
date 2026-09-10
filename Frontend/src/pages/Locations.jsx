import { useState } from "react";
import LocationJobsChart from "../components/LocationJobsChart.jsx";
import LocationSkillChart from "../components/LocationSkillChart.jsx";
import Navbar from "../components/Navbar.jsx";
import { cityJobs, citySkillDemand } from "../data/dashboardData.jsx";

function getTopSkill(city) { return [{ name: "Python", value: city.Python }, { name: "Java", value: city.Java }, { name: "JavaScript", value: city.JavaScript }, { name: "C#", value: city.CSharp }].sort((a, b) => b.value - a.value)[0]; }
function Locations() {
  const [selectedCity, setSelectedCity] = useState("Bengaluru");
  const cityJobsData = cityJobs.find((item) => item.city === selectedCity) || cityJobs[0];
  const citySkillData = citySkillDemand.find((item) => item.city === selectedCity) || citySkillDemand[0];
  const topSkill = getTopSkill(citySkillData);
  return <><Navbar /><main className="page-shell place-page">
    <div className="page-kicker"><span>09</span> PLACE REPORT <span className="kicker-rule" /> CITY SIGNALS</div>
    <section className="profile-hero"><div><p className="eyebrow">EXPLORE THE MARKET BY PLACE</p><h1>{selectedCity}<em>.</em></h1><p className="lede">A city-level view of developer jobs and the skills showing up around them.</p></div><label className="field-label" htmlFor="city">SELECT A CITY<select id="city" value={selectedCity} onChange={(event) => setSelectedCity(event.target.value)}>{cityJobs.map((item) => <option key={item.city}>{item.city}</option>)}</select></label></section>
    <section className="metric-strip">{[["Developer jobs", cityJobsData.jobs.toLocaleString()], ["Strongest skill", topSkill.name], ["Top skill demand", topSkill.value]].map(([label, value]) => <div className="metric-cell" key={label}><span>{label}</span><strong>{value}</strong></div>)}</section>
    <section className="profile-reading"><div><span className="section-number">10</span><h2>What stands out</h2></div><p><strong>{selectedCity}</strong> has <strong>{cityJobsData.jobs.toLocaleString()}</strong> developer jobs in the current sample. <strong>{topSkill.name}</strong> is the strongest skill signal at <strong>{topSkill.value}</strong>. The city comparison is directional and depends on the composition of the listings collected.</p></section>
    <section className="section-block"><div className="section-heading"><div><span className="section-number">11</span><h2>City comparison</h2></div><p>How the selected city sits against the other places in the sample.</p></div><LocationJobsChart data={cityJobs} /></section>
    <section className="section-block"><div className="section-heading"><div><span className="section-number">12</span><h2>Skill mix in {selectedCity}</h2></div><p>Demand scores for the four tracked skills.</p></div><LocationSkillChart city={citySkillData} /></section>
  </main></>;
}
export default Locations;