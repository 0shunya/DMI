import Navbar from "../components/Navbar.jsx";
import CountUp from "../components/CountUp.jsx";


import {
  stats,
  skillSalary,
} from "../data/dashboardData.jsx";
// import LiveJobs from "../components/LiveJobs";
import SkillDemandChart from "../components/SkillDemandChart.jsx";
import SkillSalaryChart from "../components/SkillSalary.jsx";
import LiveCityJobs from "../components/LiveCityJobs";
import LiveCitySkill from "../components/LiveCitySkill.jsx";
import LiveCountrySkills from "../components/LiveCountrySkills.jsx";
// import { rankSkills } from "../utils/opportunityScore.js";
import { findBestOpportunity } from "../utils/opportunityScore.js";


function Dashboard() {
  const bestOpportunity = findBestOpportunity(skillSalary);
  // const rankedSkills = rankSkills(skillSalary);
  const highestSalary = [...skillSalary].sort((a, b) => b.salary - a.salary)[0];

  return (
    <>
      <Navbar />
      <main className="page-shell">
        <div className="page-kicker"><span>01</span> MARKET BRIEFING <span className="kicker-rule" /> 10 SEPTEMBER 2026</div>
        <section className="briefing-hero">
          <div>
            <p className="eyebrow">DEVELOPER MARKET INTELLIGENCE</p>
            <h1>Where developer opportunity is actually accumulating.</h1>
          </div>
          <div className="hero-copy">
            <p>DMI tracks demand, salary, and location signals across the developer job market. We show the evidence, explain the calculation, and keep the limitations visible.</p>
            <a className="text-link" href="#signal">Read the latest signal <span>↘</span></a>
          </div>
        </section>

        <section className="signal-feature" id="signal">
          <div className="feature-label"><span className="signal-dot" /> THIS WEEK&apos;S SIGNAL</div>
          <div className="signal-grid">
            <div className="signal-statement">
              <h2>{bestOpportunity.skill} remains the strongest all-round opportunity in the current sample.</h2>
              <p>It combines high demand with a competitive salary profile. That does not make it a guaranteed career choice; it makes it the clearest signal in this dataset.</p>
            </div>
            <div className="signal-number">
              <strong>
                <CountUp
                  from={0}
                  to={bestOpportunity.opportunityScore.toFixed(1)}
                  separator=","
                  direction="up"
                  duration={1}
                  className="count-up-text"
                  style={{
                  fontWeight: 'inherit',
                  fontSize: 'inherit',
                  color: 'inherit',
                }}
                />
                </strong>

            {/* <div className="signal-number"><strong>{bestOpportunity.opportunityScore.toFixed(1)}</strong> */}
            
            <span>OPPORTUNITY<br />SCORE</span></div>
            <div className="signal-number">

                <strong> ₹
                <CountUp
                  from={0}
                  to={Number(highestSalary.salary.toFixed(1))}
                  separator=","
                  direction="up"
                  duration={1}
                  className="count-up-text"
                  style={{
                  fontWeight: 'inherit',
                  fontSize: 'inherit',
                  color: 'inherit',
                }}
                />
                </strong>


              {/* <strong>{highestSalary.salary}</strong> */}
              <span>HIGHEST AVG.<br />SALARY · {highestSalary.skill}
              </span>
              </div>
          </div>
        </section>

        <section className="section-block">
          <div className="section-heading"><div><span className="section-number">02</span><h2>The market at a glance</h2></div><p>Four numbers to orient yourself before the detail.</p></div>
          <div className="glance-grid">
            
            {/* {stats.map((stat, index) => 
            
            <div className="glance-item" key={stat.title}>
              <span className="item-index">0{index + 1}</span>
              <span className="glance-label">{stat.title}</span>
              <strong>
                {stat.value}  
                </strong></div>)} */}



{stats.map((stat, index) => {
  const numericValue = Number(
    String(stat.value).replace(/,/g, "")
  );

  const isNumeric = Number.isFinite(numericValue);

  return (
    <div className="glance-item" key={stat.title}>
      <span className="item-index">0{index + 1}</span>

      <span className="glance-label">
        {stat.title}
      </span>

<strong>
  {isNumeric ? (
    <>
      {stat.title === "AVERAGE SALARY" && "₹"}

      <CountUp
        from={0}
        to={numericValue}
        separator=","
        direction="up"
        duration={1}
        className="count-up-text"
        style={{
          fontWeight: "inherit",
          fontSize: "inherit",
          color: "inherit",
          whiteSpace: "nowrap",
          display: "inline-block",
        }}
      />

      {stat.title === "AVERAGE SALARY" && " LPA"}
    </>
  ) : (
    stat.value
  )}
</strong> 
    </div>
  );
})}

          </div>
        </section>

        <section className="section-block">
          <div className="section-heading"><div><span className="section-number">03</span><h2>Skill market</h2></div><p>Demand is not the same thing as value. Read the two together.</p></div>
          <div className="editorial-grid charts-grid">
            <div className="chart-wrap"><p className="chart-note">Python leads the current demand signal, while Go carries a smaller but higher-paying market.</p><SkillDemandChart data={skillSalary.map(({ skill, demand }) => ({ skill, demand }))} /></div>
            <div className="chart-wrap"><p className="chart-note">Average salary across the skills represented in the current sample.</p><SkillSalaryChart data={skillSalary} /></div>
          </div>
        </section>

        <section className="section-block">
          <div className="section-heading"><div><span className="section-number">04</span><h2>Location market</h2></div><p>Place changes what a skill means in practice.</p></div>
          <div className="editorial-grid charts-grid location-charts"><LiveCitySkill /><LiveCountrySkills /><LiveCityJobs /></div>
          {/* <LiveJobs /> */}
        </section>

        <section className="method-note"><span className="eyebrow">A NOTE ON THE NUMBERS</span><p>This is a directional reading of the current dataset, not a prediction engine. Listing volume is a useful signal, but it is not the whole labor market.</p></section>
      </main>
    </>
  );
}

export default Dashboard;
