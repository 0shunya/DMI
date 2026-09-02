import Navbar from "./components/Navbar";
import StatCard from "./components/StatCard";
import { stats, skillDemand, skillSalary, cityJobs, citySkillDemand, countrySkillDemand } from "./data/dashboardData.jsx";
import SkillDemandChart from "./components/SkillDemandChart";
import SkillSalaryChart from "./components/SkillSalary";
import CityJobsChart from "./components/CityJobsChart";
import CitySkillChart from "./components/CitySkillChart";
import CountrySkillChart from "./components/CountrySkillChart";
import Handwriting from "./components/Handwriting";

function App() {
  const highestSalary = skillSalary.reduce(
    (highest, current) =>
      current.salary > highest ? current.salary : highest,
    0
  );

  console.log("App Highest Salary:", highestSalary);

  const highestSalarySkill = skillSalary.find(
  (item) => item.salary === highestSalary
);
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
            value={stat.title}
            />
          ))}

        </section>

        <section className="insight-card">
          <Handwriting fontSize="32px">
            Market Insight
          </Handwriting>

          <p>
            Go currently offers the highest average salary,
            while Java and Python show strong market demand.
          </p>
        </section>

        <SkillDemandChart data={skillDemand} />
        <SkillSalaryChart data={skillSalary} />
        <CityJobsChart data={cityJobs} />
        <CitySkillChart data={citySkillDemand} />
        <CountrySkillChart data={countrySkillDemand} />
      </main>
    </>
  );
}

export default App;