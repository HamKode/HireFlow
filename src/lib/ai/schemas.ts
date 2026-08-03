import { z } from 'zod';

export const JobDescriptionSchema = z.object({
  description: z.string(),
  responsibilities: z.string(),
  required_qualifications: z.array(z.string()),
  preferred_qualifications: z.array(z.string()),
  required_skills: z.array(z.string()),
  preferred_skills: z.array(z.string()),
  screening_criteria: z.array(z.string()),
  interview_criteria: z.array(z.string()),
});
export type JobDescriptionResult = z.infer<typeof JobDescriptionSchema>;

// Component signals only — no overall/final score. The final score is always
// computed deterministically in lib/scoring/weighted-score.ts, never by the LLM.
export const ResumeAnalysisSchema = z.object({
  skills_score: z.number().min(0).max(100),
  experience_score: z.number().min(0).max(100),
  technical_score: z.number().min(0).max(100),
  education_score: z.number().min(0).max(100),
  portfolio_score: z.number().min(0).max(100),
  matched_skills: z.array(z.string()),
  missing_skills: z.array(z.string()),
  strengths: z.array(z.string()),
  concerns: z.array(z.string()),
  summary: z.string(),
  recommendation: z.enum(['shortlist', 'hr_review', 'hold', 'reject']),
});
export type ResumeAnalysisResult = z.infer<typeof ResumeAnalysisSchema>;
