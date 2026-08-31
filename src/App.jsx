import Navbar from "./components/Navbar";
import StatCard from "./components/StatCard";
import { stats, skillDemand, skillSalary, cityJobs, citySkillDemand, countrySkillDemand } from "./data/dashboardData.jsx";
import SkillDemandChart from "./components/SkillDemandChart";
import SkillSalaryChart from "./components/SkillSalary";
import CityJobsChart from "./components/CityJobsChart";
import CitySkillChart from "./components/CitySkillChart";
import CountrySkillChart from "./components/CountrySkillChart";

function App() {
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

        <SkillDemandChart data={skillDemand} />
        <SkillSalaryChart data={skillSalary} />
        <CityJobsChart data={cityJobs} />
        <CitySkillChart data={citySkillDemand} />
        <CountrySkillChart data={countrySkillDemand} />
        <CountrySkillChart data={countrySkillDemand} />
      </main>
    </>
  );
}

export default App;