import SkillDemandChart from "./SkillDemandChart";
import { ChartLoading } from "./ShimmerLoading";

function LiveSkillDemand({ data = [], loading, error = "" }) {
  const skills = data
    .map((item) => ({ skill: item.skill, demand: item.jobs }))
    .filter((item) => item.demand > 0)
    .sort((a, b) => b.demand - a.demand)
    .slice(0, 10);

  if (loading) return <ChartLoading title="Skill Demand" />;

  if (error) {
    return (
      <section className="chart-card">
        <h2>Skill Demand</h2>
        <p>{error}</p>
      </section>
    );
  }

  return <SkillDemandChart data={skills} />;
}

export default LiveSkillDemand;
