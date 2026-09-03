import { useState } from "react";

import "../styles/compare.css";

import Navbar from "../components/Navbar";
import Handwriting from "../components/Handwriting";

import { skillSalary } from "../data/dashboardData.jsx";
import { rankSkills } from "../utils/opportunityScore";

function Compare() {
  const [skillOne, setSkillOne] = useState("Python");
  const [skillTwo, setSkillTwo] = useState("Java");

  const rankedSkills = rankSkills(skillSalary);

  const firstSkill = rankedSkills.find(
    (item) => item.skill === skillOne
  );

  const secondSkill = rankedSkills.find(
    (item) => item.skill === skillTwo
  );

  const winner =
  firstSkill.opportunityScore >= secondSkill.opportunityScore
    ? firstSkill
    : secondSkill;

  return (
    <>
      <Navbar />

      <main>
        <h1>Compare Skills</h1>

        <p>
          Compare developer skills by demand, salary, and opportunity.
        </p>

        {/* Skill Selectors */}

        <section className="compare-selector-card">

          <div className="compare-selector">
            <Handwriting fontSize="28px">
              Skill 1
            </Handwriting>

            <select
              value={skillOne}
              onChange={(event) =>
                setSkillOne(event.target.value)
              }
            >
              {skillSalary.map((item) => (
                <option
                  key={item.skill}
                  value={item.skill}
                >
                  {item.skill}
                </option>
              ))}
            </select>
          </div>


          <div className="compare-vs">
            VS
          </div>


          <div className="compare-selector">
            <Handwriting fontSize="28px">
              Skill 2
            </Handwriting>

            <select
              value={skillTwo}
              onChange={(event) =>
                setSkillTwo(event.target.value)
              }
            >
              {skillSalary.map((item) => (
                <option
                  key={item.skill}
                  value={item.skill}
                >
                  {item.skill}
                </option>
              ))}
            </select>
          </div>

        </section>

        {/* Comparison */}

        <section className="comparison-card">

          <div className="comparison-column">
            <h2>{firstSkill.skill}</h2>

            <p>
              Demand
              <strong>{firstSkill.demand}</strong>
            </p>

            <p>
              Salary
              <strong>₹{firstSkill.salary} LPA</strong>
            </p>

            <p>
              Opportunity
              <strong>
                {firstSkill.opportunityScore.toFixed(1)}
              </strong>
            </p>
          </div>


          <div className="comparison-divider">
            VS
          </div>


          <div className="comparison-column">
            <h2>{secondSkill.skill}</h2>

            <p>
              Demand
              <strong>{secondSkill.demand}</strong>
            </p>

            <p>
              Salary
              <strong>₹{secondSkill.salary} LPA</strong>
            </p>

            <p>
              Opportunity
              <strong>
                {secondSkill.opportunityScore.toFixed(1)}
              </strong>
            </p>
          </div>

        </section>

        <section className="comparison-result">
  <Handwriting fontSize="30px">
    Better Opportunity
  </Handwriting>

  <h2>{winner.skill}</h2>

  <p>
    {winner.skill} has the higher opportunity score of{" "}
    <strong>{winner.opportunityScore.toFixed(1)}</strong>.
  </p>
</section>

      </main>
    </>
  );
}

export default Compare;