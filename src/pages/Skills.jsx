import { useState } from "react";

import "../styles/skills.css"

import Navbar from "../components/Navbar";
import Handwriting from "../components/Handwriting";
import SkillAnalysisChart from "../components/SkillAnalysisChart";

import { skillSalary } from "../data/dashboardData.jsx";
import { rankSkills } from "../utils/opportunityScore";


function Skills() {
  const [selectedSkill, setSelectedSkill] = useState("Python");

  const skillData = skillSalary.find(
    (item) => item.skill === selectedSkill
  );

  const rankedSkills = rankSkills(skillSalary);

const skillDataWithScore = rankedSkills.find(
  (item) => item.skill === selectedSkill
);

  return (
    <>
      <Navbar />

      <main>
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
                {skillDataWithScore.opportunityScore.toFixed(1)}
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
      </main>
    </>
  );
}

export default Skills;