import Navbar from "./components/Navbar";
import StatCard from "./components/StatCard";
import { stats, skillDemand, skillSalary, cityJobs, citySkillDemand } from "./data/dashboardData.js+";
import SkillDemandChart from "./components/SkillDemandChart";
import SkillSalaryChart from "./components/skillSalary";
import CityJobsChart from "./components/CityJobsChart";
import CitySkillChart from "./components/CitySkillChart";

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
      </main>
    </>
  );
}

export default App;