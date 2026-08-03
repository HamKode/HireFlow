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

export function resumeExtractionPrompt(resumeText: string) {
  const system = `You extract structured career information from resume text for an HR system.
${FAIRNESS_GUARDRAIL}
Only extract what the text actually supports — use null or an empty array rather than guessing.
Do not extract name, email, phone, or location — those come from the application form, not the resume.
Respond with a single JSON object matching exactly this shape (no markdown, no extra keys):
{
  "education": string | null,
  "years_experience": number | null,
  "previous_companies": string[],
  "previous_roles": string[],
  "technical_skills": string[],
  "soft_skills": string[],
  "certifications": string[],
  "projects": [{ "name": string, "description": string }]
}`;

  const user = `RESUME TEXT\n${resumeText.slice(0, 12000)}`;

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

export function interviewQuestionsPrompt(input: {
  job: { title: string; description?: string | null; required_skills: string[] };
  candidate: {
    full_name: string;
    years_experience?: number | null;
    previous_roles?: string[];
    technical_skills?: string[];
    projects?: { name: string; description: string }[];
    resume_raw_text?: string | null;
  };
}) {
  const system = `You generate personalized interview questions for a hiring team. ${FAIRNESS_GUARDRAIL}
Ground every question in the job's requirements or something specific the candidate wrote — avoid generic
filler questions a candidate could answer identically regardless of their actual background.
Respond with a single JSON object matching exactly this shape (no markdown, no extra keys):
{
  "technical_questions": string[],
  "behavioral_questions": string[],
  "situational_questions": string[],
  "candidate_specific_questions": string[],
  "follow_up_questions": string[]
}
"candidate_specific_questions" must reference something concrete from the candidate's projects/experience below
(e.g. if they claim to have built a specific system, ask them to explain a specific technical decision in it).
"follow_up_questions" are deeper probes to use if the candidate's first answer is shallow.`;

  const user = `JOB
Title: ${input.job.title}
Required skills: ${input.job.required_skills.join(', ') || 'Not specified'}
Description: ${input.job.description ?? 'Not specified'}

CANDIDATE
Name: ${input.candidate.full_name}
Years of experience: ${input.candidate.years_experience ?? 'Unknown'}
Previous roles: ${input.candidate.previous_roles?.join(', ') || 'Unknown'}
Technical skills: ${input.candidate.technical_skills?.join(', ') || 'Unknown'}
Projects: ${input.candidate.projects?.map((p) => `${p.name} — ${p.description}`).join('; ') || 'None listed'}

RESUME TEXT
${input.candidate.resume_raw_text?.slice(0, 6000) || 'Not provided.'}`;

  return { system, user };
}

export function interviewEvaluationPrompt(input: {
  job: { title: string; required_skills: string[] };
  candidate: { full_name: string };
  feedback: {
    technical_knowledge: number | null;
    problem_solving: number | null;
    communication: number | null;
    role_fit: number | null;
    experience_rating: number | null;
    strengths: string | null;
    weaknesses: string | null;
    notes: string | null;
    recommendation: string | null;
  };
}) {
  const system = `You summarize an interviewer's feedback for HR's final review. ${FAIRNESS_GUARDRAIL}
You are not deciding whether to hire — the interviewer's recommendation and HR's judgment are final. Your job is
only to organize and clarify what the interviewer already reported, and suggest a reasonable next step.
Respond with a single JSON object matching exactly this shape (no markdown, no extra keys):
{
  "summary": string,
  "strengths": string[],
  "concerns": string[],
  "technical_assessment": string,
  "communication_assessment": string,
  "role_fit_assessment": string,
  "suggested_next_action": string
}`;

  const user = `JOB
Title: ${input.job.title}
Required skills: ${input.job.required_skills.join(', ') || 'Not specified'}

CANDIDATE: ${input.candidate.full_name}

INTERVIEWER FEEDBACK (scores out of 10)
Technical knowledge: ${input.feedback.technical_knowledge ?? 'Not rated'}
Problem solving: ${input.feedback.problem_solving ?? 'Not rated'}
Communication: ${input.feedback.communication ?? 'Not rated'}
Role fit: ${input.feedback.role_fit ?? 'Not rated'}
Experience: ${input.feedback.experience_rating ?? 'Not rated'}
Interviewer's recommendation: ${input.feedback.recommendation ?? 'Not given'}
Strengths noted: ${input.feedback.strengths ?? 'None noted'}
Weaknesses noted: ${input.feedback.weaknesses ?? 'None noted'}
Additional notes: ${input.feedback.notes ?? 'None'}`;

  return { system, user };
}
