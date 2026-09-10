import { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { skillSalary } from "../data/dashboardData.jsx";
import { rankSkills } from "../utils/opportunityScore.js";

function SelectSkill({ label, value, onChange }) { return <label className="field-label">{label}<select value={value} onChange={(event) => onChange(event.target.value)}>{skillSalary.map((item) => <option key={item.skill}>{item.skill}</option>)}</select></label>; }
function Compare() {
  const [skillOne, setSkillOne] = useState("Python");
  const [skillTwo, setSkillTwo] = useState("Java");
  const rankedSkills = rankSkills(skillSalary);
  const first = rankedSkills.find((item) => item.skill === skillOne) || rankedSkills[0];
  const second = rankedSkills.find((item) => item.skill === skillTwo) || rankedSkills[1];
  const winner = first.opportunityScore >= second.opportunityScore ? first : second;
  return <><Navbar /><main className="page-shell compare-page">
    <div className="page-kicker"><span>13</span> COMPARISON DESK <span className="kicker-rule" /> TWO SKILLS, ONE VIEW</div>
    <section className="compare-hero"><p className="eyebrow">MAKE THE TRADE-OFF VISIBLE</p><h1>Skill against skill<em>.</em></h1><p className="lede">Compare demand, salary, and opportunity without pretending that one number can make the decision for you.</p></section>
    <section className="compare-controls"><SelectSkill label="SKILL ONE" value={skillOne} onChange={setSkillOne} /><span className="versus">VS</span><SelectSkill label="SKILL TWO" value={skillTwo} onChange={setSkillTwo} /></section>
    <section className="comparison-table"><div className="comparison-head"><span>MEASURE</span><strong>{first.skill}</strong><strong>{second.skill}</strong></div>{[["Demand", first.demand, second.demand], ["Average salary", `₹${first.salary} LPA`, `₹${second.salary} LPA`], ["Opportunity", first.opportunityScore.toFixed(1), second.opportunityScore.toFixed(1)]].map(([label, a, b]) => <div className="comparison-row" key={label}><span>{label}</span><strong className={a === Math.max(a, b) ? "leading" : ""}>{a}</strong><strong className={b === Math.max(a, b) ? "leading" : ""}>{b}</strong></div>)}</section>
    <section className="verdict"><div><span className="section-number">14</span><h2>The short version</h2></div><div><p><strong>{winner.skill}</strong> leads on overall opportunity in the current sample.</p><p className="muted">Choose based on the market you want to enter, the work you want to do, and the evidence—not on a score alone.</p></div></section>
  </main></>;
}
export default Compare;
