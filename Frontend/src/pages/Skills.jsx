import { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import SkillAnalysisChart from "../components/SkillAnalysisChart.jsx";
import { skillSalary } from "../data/dashboardData.jsx";
import { rankSkills } from "../utils/opportunityScore.js";

function Skills() {
  const [selectedSkill, setSelectedSkill] = useState("Python");
  const rankedSkills = rankSkills(skillSalary);
  const skillData = rankedSkills.find((item) => item.skill === selectedSkill) || rankedSkills[0];
  const relatedSkills = rankedSkills.filter((item) => item.skill !== selectedSkill).slice(0, 3);

  return <><Navbar /><main className="page-shell profile-page">
    <div className="page-kicker"><span>05</span> SKILL PROFILE <span className="kicker-rule" /> CURRENT SAMPLE</div>
    <section className="profile-hero"><div><p className="eyebrow">EXPLORE THE MARKET BY SKILL</p><h1>{skillData.skill}<em>.</em></h1><p className="lede">A practical reading of demand, salary, and opportunity for one developer skill.</p></div><label className="field-label" htmlFor="skill">SELECT A SKILL<select id="skill" value={selectedSkill} onChange={(event) => setSelectedSkill(event.target.value)}>{skillSalary.map((item) => <option key={item.skill}>{item.skill}</option>)}</select></label></section>
    <section className="metric-strip">{[["Demand score "," ", skillData.demand], ["Average salary ", " ", `₹${skillData.salary} LPA`], ["Opportunity score ", skillData.opportunityScore.toFixed(1)]].map(([label, value]) => <div className="metric-cell" key={label}><span>{label}</span><strong>{value}</strong></div>)}</section>
    <section className="profile-reading"><div><span className="section-number">06</span><h2>Our read</h2></div><p><strong>{selectedSkill}</strong> has a demand score of <strong>{skillData.demand}</strong> and an average salary of <strong>₹{skillData.salary} LPA</strong>. The score is comparative: it shows how this skill sits against the other skills in the current dataset, not what any individual candidate will earn.</p></section>
    <section className="section-block"><div className="section-heading"><div><span className="section-number">07</span><h2>Demand versus pay</h2></div><p>Use this view to see whether market attention and compensation move together.</p></div><SkillAnalysisChart skill={skillData} maxSalary={Math.max(...skillSalary.map((item) => item.salary))} /></section>
    <section className="related-skills"><div><span className="section-number">08</span><h2>What to learn next</h2><p>Other skills with strong market opportunity.</p></div><div className="related-list">{relatedSkills.map((skill, index) => <div className="related-skill" key={skill.skill}><span>0{index + 1}</span><strong>{skill.skill}</strong><span>{skill.opportunityScore.toFixed(1)} opportunity</span></div>)}</div></section>
  </main></>;
}
export default Skills;
