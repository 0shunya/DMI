import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";

import {
  stats,
  skillDemand,
  skillSalary,
  cityJobs,
  citySkillDemand,
  countrySkillDemand,
} from "../data/dashboardData.jsx";

import SkillDemandChart from "../components/SkillDemandChart";
import SkillSalaryChart from "../components/skillSalary.jsx";
import CityJobsChart from "../components/CityJobsChart";
import CitySkillChart from "../components/CitySkillChart";
import CountrySkillChart from "../components/CountrySkillChart";
import Handwriting from "../components/Handwriting";

import {
  findBestOpportunity,
  rankSkills,
} from "../utils/opportunityScore";

function Dashboard() {
  const highestSalary = skillSalary.reduce(
    (highest, current) =>
      current.salary > highest ? current.salary : highest,
    0
  );

  const highestSalarySkill = skillSalary.find(
    (item) => item.salary === highestSalary
  );

  const bestOpportunity = findBestOpportunity(skillSalary);
  const rankedSkills = rankSkills(skillSalary);

  return (
    <>
      <Navbar />

      <main>
        <h1>Developer Market Intelligence</h1>

        <p>Understand the programming job market.</p>

        <section className="stats">
          {stats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
            />
          ))}
        </section>

        <div className="insight-layout">

          <section className="insight-card">
            <Handwriting fontSize="32px">
              Market Insight
            </Handwriting>

            <p>
              <strong>{bestOpportunity.skill}</strong> has the best
              overall opportunity score at{" "}
              <strong>
                {bestOpportunity.opportunityScore.toFixed(1)}
              </strong>.
            </p>

            <p>
              <strong>{highestSalarySkill.skill}</strong> offers the
              highest average salary at ₹
              {highestSalarySkill.salary} LPA.
            </p>
          </section>

          <section className="top-skills">
            <Handwriting fontSize="32px">
              Top Opportunities
            </Handwriting>

            {rankedSkills.slice(0, 3).map((skill, index) => (
              <div className="top-skill" key={skill.skill}>
                <span>#{index + 1}</span>

                <strong>{skill.skill}</strong>

                <span>
                  {skill.opportunityScore.toFixed(1)}
                </span>
              </div>
            ))}
          </section>

        </div>

        <div className="charts-grid">

          <SkillDemandChart data={skillDemand} />

          <CityJobsChart data={cityJobs} />

          <CitySkillChart data={citySkillDemand} />

          <CountrySkillChart data={countrySkillDemand} />

          <SkillSalaryChart data={skillSalary} />

        </div>
      </main>
    </>
  );
}

export default Dashboard;