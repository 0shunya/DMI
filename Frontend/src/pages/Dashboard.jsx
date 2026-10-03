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
        <div className="page-kicker"><span>01</span> MARKET BRIEFING <span className="kicker-rule" /> ILLUSTRATIVE EXAMPLE + STORED JOB SNAPSHOT</div>
        <section className="briefing-hero">
          <div>
            <p className="eyebrow">DEVELOPER MARKET INTELLIGENCE</p>
            <h1>Where developer opportunity is actually accumulating.</h1>
          </div>
          <div className="hero-copy">
            <p>Explore an illustrative skill-and-salary briefing, then inspect a separately sourced job-board snapshot. The example numbers below are not live market measurements.</p>
            <a className="text-link" href="/jobs">Explore the job snapshot <span>↗</span></a>
          </div>
        </section>

        <section className="signal-feature" id="signal">
          <div className="feature-label"><span className="signal-dot" /> ILLUSTRATIVE SKILL EXAMPLE · NOT LIVE DATA</div>
          <div className="signal-grid">
            <div className="signal-statement">
              <h2>{bestOpportunity.skill} leads this example opportunity score.</h2>
              <p>This demonstration combines sample demand and sample salary values. It does not describe the live labor market or predict hiring outcomes.</p>
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
          <div className="section-heading"><div><span className="section-number">02</span><h2>Sample at a glance</h2></div><p>Illustrative figures, not measured from current listings.</p></div>
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
          <div className="section-heading"><div><span className="section-number">03</span><h2>Sample skill view</h2></div><p>Example demand and salary values; not live statistics.</p></div>
          <div className="editorial-grid charts-grid">
            <div className="chart-wrap"><p className="chart-note">Python leads the current demand signal, while Go carries a smaller but higher-paying market.</p><SkillDemandChart data={skillSalary.map(({ skill, demand }) => ({ skill, demand }))} /></div>
            <div className="chart-wrap"><p className="chart-note">Average salary across the skills represented in the current sample.</p><SkillSalaryChart data={skillSalary} /></div>
          </div>
        </section>

        <section className="section-block">
          <div className="section-heading"><div><span className="section-number">04</span><h2>Job snapshot by place</h2></div><p>Derived from stored listings; it may be empty until import succeeds.</p></div>
          <div className="editorial-grid charts-grid location-charts"><LiveCitySkill /><LiveCountrySkills /><LiveCityJobs /></div>
          {/* <LiveJobs /> */}
        </section>

        <section className="method-note"><span className="eyebrow">A NOTE ON THE NUMBERS</span><p>The first three sections are illustrative data; the location charts come from the stored job snapshot. Neither is a prediction of hiring outcomes. <a href="/jobs">Inspect the listings and their sources.</a></p></section>
      </main>
    </>
  );
}

export default Dashboard;
