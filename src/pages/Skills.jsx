import { useState } from "react";

import "../styles/skills.css"

import Navbar from "../components/Navbar";
import Handwriting from "../components/Handwriting";
import SkillAnalysisChart from "../components/SkillAnalysisChart";

import { skillSalary } from "../data/dashboardData.jsx";
import { rankSkills } from "../utils/opportunityScore";


function Skills() {
  const [selectedSkill, setSelectedSkill] = useState("Python");

const rankedSkills = rankSkills(skillSalary);

const skillData = rankedSkills.find(
  (item) => item.skill === selectedSkill
);

const relatedSkills = rankedSkills
  .filter((item) => item.skill !== selectedSkill)
  .slice(0, 3);

  return (
    <>
      <Navbar />

      <main>
        <Handwriting fontSize="30px">
        <h1>Skills Intelligence</h1>

        <p>
          Explore demand, salary, and opportunity for each skill.
        </p>

        {/* Skill Selector */}

        <section className="skill-selector-card">
          <Handwriting fontSize="30px">
            Explore a Skill
          </Handwriting>

          <label htmlFor="skill">Select Skill:</label>

          <select
            id="skill"
            value={selectedSkill}
            onChange={(event) =>
              setSelectedSkill(event.target.value)
            }
          >
            {skillSalary.map((item) => (
              <option key={item.skill} value={item.skill}>
                {item.skill}
              </option>
            ))}
          </select>
        </section>

        {/* Skill Stats */}

<section className="skill-stats">

  <div className="skill-stat-card">
    <p>Demand Score</p>
    <h2>{skillData.demand}</h2>
  </div>

  <div className="skill-stat-card">
    <p>Average Salary</p>
    <h2>₹{skillData.salary} LPA</h2>
  </div>

  <div className="skill-stat-card">
    <p>Opportunity Score</p>
    <h2>
      {skillData.opportunityScore.toFixed(1)}
    </h2>
  </div>

</section>

        {/* Selected Skill */}

        <section className="skill-detail-card">
          <Handwriting fontSize="32px">
            {selectedSkill}
          </Handwriting>

          <p>
            {selectedSkill} has a demand score of{" "}
            <strong>{skillData.demand}</strong> and an average
            salary of <strong>₹{skillData.salary} LPA</strong>.
          </p>
        </section>

       <SkillAnalysisChart
  skill={skillData}
  maxSalary={Math.max(...skillSalary.map((item) => item.salary))}
/>

<section className="related-skills">
  <Handwriting fontSize="30px">
    What to Learn Next
  </Handwriting>

  <p>
    Other skills with strong market opportunity.
  </p>

  {relatedSkills.map((skill, index) => (
    <div className="related-skill" key={skill.skill}>
      <span>#{index + 1}</span>

      <strong>{skill.skill}</strong>

      <span>
        {skill.opportunityScore.toFixed(1)}
      </span>
    </div>
  ))}
</section>

</Handwriting>
      </main>
    </>
  );
}

export default Skills;