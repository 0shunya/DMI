import Navbar from "../components/Navbar.jsx";
import StatCard from "../components/StatCard.jsx";

import {
  stats,
  skillDemand,
  skillSalary,
  cityJobs,
  citySkillDemand,
  countrySkillDemand,
} from "../data/dashboardData.jsx";

import LiveJobs from "../components/LiveJobs";
import SkillDemandChart from "../components/SkillDemandChart.jsx";
import SkillSalaryChart from "../components/SkillSalary.jsx";
import CityJobsChart from "../components/CityJobsChart.jsx";
import CitySkillChart from "../components/CitySkillChart.jsx";
import CountrySkillChart from "../components/CountrySkillChart.jsx";
import LiveSkillDemand from "../components/LiveSkillDemand";
import LiveCityJobs from "../components/LiveCityJobs";
import LiveCitySkill from "../components/LiveCitySkill.jsx"

import {
  findBestOpportunity,
  rankSkills,
} from "../utils/opportunityScore.js";

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
        {/* ==============================
            PAGE HEADER
        ============================== */}

        <h1>Developer Market Intelligence</h1>

        <p>Understand the programming job market.</p>


        {/* ==============================
            OVERVIEW
        ============================== */}

        <section className="dashboard-section">
          <h3 className="section-label">OVERVIEW</h3>

          <section className="stats">
            {stats.map((stat) => (
              <StatCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
              />
            ))}
          </section>
        </section>


        {/* ==============================
            OPPORTUNITY
        ============================== */}

        <section className="dashboard-section">
          <h3 className="section-label">OPPORTUNITY</h3>

          <div className="insight-layout">

            <section className="insight-card">
              <h2>Market Insight</h2>

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
              <h2>Top Opportunities</h2>

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
        </section>


        {/* ==============================
            SKILL MARKET
        ============================== */}

        <section className="dashboard-section">
          <h3 className="section-label">SKILL MARKET</h3>

          <div className="charts-grid">

            <LiveSkillDemand />

            <SkillSalaryChart data={skillSalary} />

          </div>
        </section>


        {/* ==============================
            LOCATION MARKET
        ============================== */}

        <section className="dashboard-section">
          <h3 className="section-label">LOCATION MARKET</h3>

          <div className="charts-grid">

            <LiveCitySkill />

            <CountrySkillChart data={countrySkillDemand} />

             <div className="full-width-chart">
              <LiveCityJobs />
            </div>

<LiveJobs />

          </div>
        </section>

      </main>
    </>
  );
}

export default Dashboard;