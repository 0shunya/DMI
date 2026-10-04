import { useEffect, useState } from "react";
import { api } from "../api.js";

import SkillDemandChart from "./SkillDemandChart";

function LiveSkillDemand() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const data = await api("/api/skills");

        const formattedData = data
        .map((item) => ({
            skill: item.skill,
            demand: item.jobs,
        }))
        .filter((item) => item.demand > 0)
        .sort((a, b) => b.demand - a.demand)
        .slice(0, 10);

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
        <p>Loading stored job snapshot...</p>
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
