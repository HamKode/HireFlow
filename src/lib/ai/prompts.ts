const FAIRNESS_GUARDRAIL = `Do not use or infer race, religion, gender, disability, age, political affiliation,
marital status, or any other protected characteristic when generating content or scores.
Base every judgment strictly on job-relevant skills, experience, and evidence from the
provided text. Every claim must be explainable by pointing to specific evidence.`;

export function jobDescriptionPrompt(input: {
  title: string;
  department?: string | null;
  employmentType: string;
  experienceRequired?: string | null;
  requiredSkills: string[];
  preferredSkills?: string[];
}) {
  const system = `You are an expert technical recruiter and HR copywriter. ${FAIRNESS_GUARDRAIL}
Respond with a single JSON object matching exactly this shape (no markdown, no extra keys):
{
  "description": string,
  "responsibilities": string,
  "required_qualifications": string[],
  "preferred_qualifications": string[],
  "required_skills": string[],
  "preferred_skills": string[],
  "screening_criteria": string[],
  "interview_criteria": string[]
}`;

  const user = `Write a professional job posting for this role. HR will review and edit before publishing.

Position: ${input.title}
Department: ${input.department ?? 'Not specified'}
Employment type: ${input.employmentType}
Experience required: ${input.experienceRequired ?? 'Not specified'}
Required skills: ${input.requiredSkills.join(', ') || 'Not specified'}
Preferred skills: ${input.preferredSkills?.join(', ') || 'Not specified'}

"screening_criteria" should be short, checkable bullet points HR can use to filter resumes.
"interview_criteria" should be short bullet points describing what a strong interview performance looks like.`;

  return { system, user };
}

export function resumeAnalysisPrompt(input: {
  job: {
    title: string;
    description?: string | null;
    required_skills: string[];
    preferred_skills: string[];
    experience_required?: string | null;
    education?: string | null;
  };
  candidate: {
    full_name: string;
    years_experience?: number | null;
    education?: string | null;
    previous_companies?: string[];
    previous_roles?: string[];
    technical_skills?: string[];
    soft_skills?: string[];
    certifications?: string[];
    resume_raw_text?: string | null;
  };
}) {
  const system = `You are an AI recruitment screening assistant. Your output is decision-support only —
a human reviewer always makes the final call. ${FAIRNESS_GUARDRAIL}
Score each component from 0-100 based only on how well the evidence matches the job's requirements.
Do NOT compute or return an overall/final score — that is calculated separately.
Respond with a single JSON object matching exactly this shape (no markdown, no extra keys):
{
  "skills_score": number,
  "experience_score": number,
  "technical_score": number,
  "education_score": number,
  "portfolio_score": number,
  "matched_skills": string[],
  "missing_skills": string[],
  "strengths": string[],
  "concerns": string[],
  "summary": string,
  "recommendation": "shortlist" | "hr_review" | "hold" | "reject"
}`;

  const user = `JOB REQUIREMENTS
Title: ${input.job.title}
Required skills: ${input.job.required_skills.join(', ') || 'Not specified'}
Preferred skills: ${input.job.preferred_skills.join(', ') || 'Not specified'}
Experience required: ${input.job.experience_required ?? 'Not specified'}
Education: ${input.job.education ?? 'Not specified'}
Description: ${input.job.description ?? 'Not specified'}

CANDIDATE PROFILE
Name: ${input.candidate.full_name}
Years of experience: ${input.candidate.years_experience ?? 'Unknown'}
Education: ${input.candidate.education ?? 'Unknown'}
Previous companies: ${input.candidate.previous_companies?.join(', ') || 'Unknown'}
Previous roles: ${input.candidate.previous_roles?.join(', ') || 'Unknown'}
Technical skills: ${input.candidate.technical_skills?.join(', ') || 'Unknown'}
Soft skills: ${input.candidate.soft_skills?.join(', ') || 'Unknown'}
Certifications: ${input.candidate.certifications?.join(', ') || 'None listed'}

RESUME TEXT
${input.candidate.resume_raw_text?.slice(0, 8000) || 'Not provided — score using the structured profile above only.'}`;

  return { system, user };
}
