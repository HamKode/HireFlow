// Hand-written to match supabase/schema.sql. Regenerate with the Supabase CLI
// (`supabase gen types typescript`) once the project is linked, if preferred.

export type UserRole = 'admin' | 'hr_manager' | 'recruiter' | 'hiring_manager' | 'interviewer';

export type JobStatus = 'draft' | 'published' | 'paused' | 'closed';
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'temporary';

export type CandidateSource =
  | 'linkedin' | 'indeed' | 'company_website' | 'referral'
  | 'recruiter' | 'job_board' | 'social_media' | 'other';

export type ApplicationStatus =
  | 'applied' | 'screening' | 'hr_review' | 'shortlisted' | 'interview_scheduled'
  | 'interviewed' | 'final_review' | 'offer_pending' | 'offer_sent' | 'offer_accepted'
  | 'hired' | 'onboarding' | 'rejected' | 'withdrawn' | 'on_hold';

export type ScoringRecommendation = 'shortlist' | 'hr_review' | 'hold' | 'reject';

export type InterviewType = 'phone_screen' | 'technical' | 'behavioral' | 'panel' | 'final' | 'other';
export type InterviewStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
export type InterviewRecommendation = 'strong_hire' | 'hire' | 'hold' | 'no_hire';

export type OfferStatus = 'draft' | 'sent' | 'viewed' | 'signed' | 'declined' | 'expired' | 'revoked';
export type OnboardingTaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';
export type NotificationChannel = 'email' | 'slack' | 'dashboard' | 'sms';
export type AutomationLogStatus = 'success' | 'failure' | 'retrying';

export interface Organization {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  organization_id: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  organization_id: string;
  title: string;
  department: string | null;
  location: string | null;
  employment_type: EmploymentType;
  salary_min: number | null;
  salary_max: number | null;
  experience_required: string | null;
  education: string | null;
  required_skills: string[];
  preferred_skills: string[];
  responsibilities: string | null;
  description: string | null;
  hiring_manager_id: string | null;
  positions_count: number;
  application_deadline: string | null;
  status: JobStatus;
  scoring_weights: { skills: number; experience: number; technical: number; education: number; portfolio: number };
  screening_criteria: unknown;
  interview_criteria: unknown;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Candidate {
  id: string;
  organization_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  location: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  years_experience: number | null;
  education: string | null;
  previous_companies: string[];
  previous_roles: string[];
  technical_skills: string[];
  soft_skills: string[];
  certifications: string[];
  projects: unknown[];
  resume_url: string | null;
  resume_raw_text: string | null;
  is_duplicate_of: string | null;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  organization_id: string;
  job_id: string;
  candidate_id: string;
  status: ApplicationStatus;
  source: CandidateSource;
  expected_salary: number | null;
  notice_period: string | null;
  cover_letter: string | null;
  recruiter_notes: string | null;
  rejected_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface CandidateScore {
  id: string;
  organization_id: string;
  application_id: string;
  skills_score: number | null;
  experience_score: number | null;
  technical_score: number | null;
  education_score: number | null;
  portfolio_score: number | null;
  weighted_final_score: number | null;
  matched_skills: string[];
  missing_skills: string[];
  strengths: string[];
  concerns: string[];
  ai_summary: string | null;
  ai_recommendation: ScoringRecommendation | null;
  routing_decision: string | null;
  model_used: string | null;
  raw_ai_response: unknown;
  created_at: string;
  updated_at: string;
}

export interface Interview {
  id: string;
  organization_id: string;
  application_id: string;
  interviewer_id: string | null;
  interview_type: InterviewType;
  scheduled_at: string | null;
  duration_minutes: number;
  meeting_link: string | null;
  status: InterviewStatus;
  ai_generated_questions: unknown;
  created_at: string;
  updated_at: string;
}

export interface InterviewFeedback {
  id: string;
  organization_id: string;
  interview_id: string;
  interviewer_id: string | null;
  technical_knowledge: number | null;
  problem_solving: number | null;
  communication: number | null;
  role_fit: number | null;
  experience_rating: number | null;
  strengths: string | null;
  weaknesses: string | null;
  notes: string | null;
  recommendation: InterviewRecommendation | null;
  ai_evaluation_summary: string | null;
  ai_next_action: string | null;
  created_at: string;
  updated_at: string;
}

export interface Offer {
  id: string;
  organization_id: string;
  application_id: string;
  candidate_id: string;
  job_id: string;
  salary: number;
  joining_date: string | null;
  employment_type: EmploymentType;
  benefits: string | null;
  acceptance_deadline: string | null;
  pdf_url: string | null;
  status: OfferStatus;
  esignature_provider: string | null;
  esignature_envelope_id: string | null;
  signed_at: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface OnboardingTask {
  id: string;
  organization_id: string;
  candidate_id: string;
  offer_id: string | null;
  task_name: string;
  description: string | null;
  assigned_to: string | null;
  due_date: string | null;
  status: OnboardingTaskStatus;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  organization_id: string;
  user_id: string | null;
  channel: NotificationChannel;
  title: string;
  message: string;
  is_read: boolean;
  related_application_id: string | null;
  created_at: string;
}

export interface AutomationLog {
  id: string;
  organization_id: string | null;
  candidate_id: string | null;
  application_id: string | null;
  action: string;
  status: AutomationLogStatus;
  source: string;
  payload: unknown;
  error_message: string | null;
  created_at: string;
}
