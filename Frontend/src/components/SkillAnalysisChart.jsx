function SkillAnalysisChart({ skill, maxSalary }) {
  const salaryPercentage = (skill.salary / maxSalary) * 100;

  return (
    <div className="chart-card">
      <h2>{skill.skill} — Skill Analysis</h2>

      <div className="skill-analysis">

        {/* Demand */}
        <div className="metric">
          <div className="metric-header">
            <span>Demand Score</span>
            <strong>{skill.demand}</strong>
          </div>

          <div className="metric-bar">
            <div
              className="metric-fill"
              style={{ width: `${skill.demand}%` }}
            ></div>
          </div>
        </div>


        {/* Salary */}
        <div className="metric">
          <div className="metric-header">
            <span>Average Salary</span>
            <strong>₹{skill.salary} LPA</strong>
          </div>

          <div className="metric-bar">
            <div
              className="metric-fill salary-fill"
              style={{ width: `${salaryPercentage}%` }}
            ></div>
          </div>
        </div>


        {/* Opportunity */}
        <div className="metric">
          <div className="metric-header">
            <span>Opportunity Score</span>
            <strong>
              {skill.opportunityScore.toFixed(1)}
            </strong>
          </div>

          <div className="metric-bar">
            <div
              className="metric-fill"
              style={{
                width: `${skill.opportunityScore}%`,
              }}
            ></div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default SkillAnalysisChart;