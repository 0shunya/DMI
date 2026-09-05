import { useEffect, useState } from "react";

import SkillDemandChart from "./SkillDemandChart";

function LiveSkillDemand() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/skills"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch skill data");
        }

        const data = await response.json();

        const formattedData = data
        .map((item) => ({
            skill: item.skill,
            demand: item.jobs,
        }))
        .filter((item) => item.demand > 0)
        .sort((a, b) => b.demand - a.demand)
        .slice(0, 10);

        setSkills(formattedData);

        setSkills(formattedData);
      } catch (error) {
        console.error(error);
        setError("Unable to load live skill data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  if (loading) {
    return (
      <section className="chart-card">
        <h2>Skill Demand</h2>
        <p>Loading live market data...</p>
      </section>
    );
  }

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