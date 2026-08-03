export type ScoringWeights = {
  skills: number;
  experience: number;
  technical: number;
  education: number;
  portfolio: number;
};

export type ComponentScores = {
  skills_score: number;
  experience_score: number;
  technical_score: number;
  education_score: number;
  portfolio_score: number;
};

export const DEFAULT_WEIGHTS: ScoringWeights = {
  skills: 35,
  experience: 25,
  technical: 20,
  education: 10,
  portfolio: 10,
};

// The only place a candidate's final numeric score is computed. The LLM
// supplies the five component signals; this pure function does the math —
// per the project rule that AI never determines the final score directly.
export function calculateWeightedScore(scores: ComponentScores, weights: ScoringWeights = DEFAULT_WEIGHTS): number {
  const totalWeight = weights.skills + weights.experience + weights.technical + weights.education + weights.portfolio;
  if (totalWeight <= 0) {
    throw new Error('Scoring weights must sum to a positive number.');
  }

  const weighted =
    scores.skills_score * weights.skills +
    scores.experience_score * weights.experience +
    scores.technical_score * weights.technical +
    scores.education_score * weights.education +
    scores.portfolio_score * weights.portfolio;

  return Math.round((weighted / totalWeight) * 100) / 100;
}

// Human-in-the-loop routing: a score threshold only ever *suggests* a stage,
// HR always retains a review path. Never auto-rejects on score alone.
export function suggestRoutingDecision(finalScore: number): 'shortlist' | 'hr_review' | 'hold' {
  if (finalScore >= 85) return 'shortlist';
  if (finalScore >= 70) return 'hr_review';
  return 'hold';
}
