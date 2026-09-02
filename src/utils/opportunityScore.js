export function calculateOpportunityScore(
  salary,
  highestSalary,
  demand
) {
  const salaryScore = (salary / highestSalary) * 100;

  return salaryScore * 0.5 + demand * 0.5;
}

export function findBestOpportunity(data) {
  const highestSalary = Math.max(
    ...data.map((item) => item.salary)
  );

  return data.reduce(
    (best, current) => {
      const opportunityScore = calculateOpportunityScore(
        current.salary,
        highestSalary,
        current.demand
      );

      return opportunityScore > best.opportunityScore
        ? { ...current, opportunityScore }
        : best;
    },
    { opportunityScore: 0 }
  );
}

export function rankSkills(data) {
  const highestSalary = Math.max(
    ...data.map((item) => item.salary)
  );

  return data
    .map((item) => ({
      ...item,
      opportunityScore: calculateOpportunityScore(
        item.salary,
        highestSalary,
        item.demand
      ),
    }))
    .sort(
      (a, b) => b.opportunityScore - a.opportunityScore
    );
}