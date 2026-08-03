-- HireFlow AI — Database Schema
-- Run this once in the Supabase SQL editor on a fresh project.
-- Supabase enables pgcrypto by default, so gen_random_uuid() is available.

-- =========================================================================
-- ENUM TYPES
-- =========================================================================

create type user_role as enum ('admin', 'hr_manager', 'recruiter', 'hiring_manager', 'interviewer');

create type job_status as enum ('draft', 'published', 'paused', 'closed');
create type employment_type as enum ('full_time', 'part_time', 'contract', 'internship', 'temporary');

create type candidate_source as enum ('linkedin', 'indeed', 'company_website', 'referral', 'recruiter', 'job_board', 'social_media', 'other');

create type application_status as enum (
  'applied', 'screening', 'hr_review', 'shortlisted', 'interview_scheduled',
  'interviewed', 'final_review', 'offer_pending', 'offer_sent', 'offer_accepted',
  'hired', 'onboarding', 'rejected', 'withdrawn', 'on_hold'
);

create type scoring_recommendation as enum ('shortlist', 'hr_review', 'hold', 'reject');

create type interview_type as enum ('phone_screen', 'technical', 'behavioral', 'panel', 'final', 'other');
create type interview_status as enum ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled');

create type interview_recommendation as enum ('strong_hire', 'hire', 'hold', 'no_hire');

create type offer_status as enum ('draft', 'sent', 'viewed', 'signed', 'declined', 'expired', 'revoked');

create type onboarding_task_status as enum ('pending', 'in_progress', 'completed', 'blocked');

create type notification_channel as enum ('email', 'slack', 'dashboard', 'sms');

create type automation_log_status as enum ('success', 'failure', 'retrying');

-- =========================================================================
-- HELPER: updated_at trigger
-- =========================================================================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- =========================================================================
-- PROFILES (extends auth.users, adds role)
-- =========================================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role user_role not null default 'recruiter',
  avatar_url text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'recruiter');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Role lookup used by RLS policies (security definer to avoid recursive RLS on profiles).
create or replace function public.current_role()
returns user_role as $$
  select role from public.profiles where id = auth.uid();
$$ language sql stable security definer set search_path = public;

-- =========================================================================
-- JOBS
-- =========================================================================

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  department text,
  location text,
  employment_type employment_type not null default 'full_time',
  salary_min numeric(12,2),
  salary_max numeric(12,2),
  experience_required text,
  education text,
  required_skills text[] not null default '{}',
  preferred_skills text[] not null default '{}',
  responsibilities text,
  description text,
  hiring_manager_id uuid references public.profiles(id),
  positions_count int not null default 1,
  application_deadline date,
  status job_status not null default 'draft',
  scoring_weights jsonb not null default '{"skills":35,"experience":25,"technical":20,"education":10,"portfolio":10}',
  screening_criteria jsonb,
  interview_criteria jsonb,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_jobs_status on public.jobs(status);
create index idx_jobs_hiring_manager on public.jobs(hiring_manager_id);

create trigger trg_jobs_updated_at before update on public.jobs
  for each row execute function public.set_updated_at();

-- =========================================================================
-- CANDIDATES
-- =========================================================================

create table public.candidates (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  location text,
  linkedin_url text,
  github_url text,
  portfolio_url text,
  years_experience numeric(4,1),
  education text,
  previous_companies text[] default '{}',
  previous_roles text[] default '{}',
  technical_skills text[] default '{}',
  soft_skills text[] default '{}',
  certifications text[] default '{}',
  projects jsonb default '[]',
  resume_url text,
  resume_raw_text text,
  is_duplicate_of uuid references public.candidates(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email)
);

create index idx_candidates_email on public.candidates(email);
create index idx_candidates_phone on public.candidates(phone);
create index idx_candidates_linkedin on public.candidates(linkedin_url);

create trigger trg_candidates_updated_at before update on public.candidates
  for each row execute function public.set_updated_at();

-- =========================================================================
-- APPLICATIONS (job <-> candidate)
-- =========================================================================

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  status application_status not null default 'applied',
  source candidate_source not null default 'other',
  expected_salary numeric(12,2),
  notice_period text,
  cover_letter text,
  recruiter_notes text,
  rejected_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id, candidate_id)
);

create index idx_applications_job on public.applications(job_id);
create index idx_applications_candidate on public.applications(candidate_id);
create index idx_applications_status on public.applications(status);
create index idx_applications_source on public.applications(source);

create trigger trg_applications_updated_at before update on public.applications
  for each row execute function public.set_updated_at();

-- =========================================================================
-- CANDIDATE_SCORES (AI signals + deterministic final score, per application)
-- =========================================================================

create table public.candidate_scores (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  skills_score numeric(5,2),
  experience_score numeric(5,2),
  technical_score numeric(5,2),
  education_score numeric(5,2),
  portfolio_score numeric(5,2),
  weighted_final_score numeric(5,2),
  matched_skills text[] default '{}',
  missing_skills text[] default '{}',
  strengths text[] default '{}',
  concerns text[] default '{}',
  ai_summary text,
  ai_recommendation scoring_recommendation,
  routing_decision text,
  model_used text,
  raw_ai_response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (application_id)
);

create index idx_candidate_scores_application on public.candidate_scores(application_id);

create trigger trg_candidate_scores_updated_at before update on public.candidate_scores
  for each row execute function public.set_updated_at();

-- =========================================================================
-- INTERVIEWS
-- =========================================================================

create table public.interviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  interviewer_id uuid references public.profiles(id),
  interview_type interview_type not null default 'technical',
  scheduled_at timestamptz,
  duration_minutes int default 45,
  meeting_link text,
  status interview_status not null default 'scheduled',
  ai_generated_questions jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_interviews_application on public.interviews(application_id);
create index idx_interviews_interviewer on public.interviews(interviewer_id);
create index idx_interviews_status on public.interviews(status);

create trigger trg_interviews_updated_at before update on public.interviews
  for each row execute function public.set_updated_at();

-- =========================================================================
-- INTERVIEW_FEEDBACK
-- =========================================================================

create table public.interview_feedback (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid not null references public.interviews(id) on delete cascade,
  interviewer_id uuid references public.profiles(id),
  technical_knowledge int check (technical_knowledge between 1 and 10),
  problem_solving int check (problem_solving between 1 and 10),
  communication int check (communication between 1 and 10),
  role_fit int check (role_fit between 1 and 10),
  experience_rating int check (experience_rating between 1 and 10),
  strengths text,
  weaknesses text,
  notes text,
  recommendation interview_recommendation,
  ai_evaluation_summary text,
  ai_next_action text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (interview_id)
);

create index idx_interview_feedback_interview on public.interview_feedback(interview_id);

create trigger trg_interview_feedback_updated_at before update on public.interview_feedback
  for each row execute function public.set_updated_at();

-- =========================================================================
-- OFFERS
-- =========================================================================

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  salary numeric(12,2) not null,
  joining_date date,
  employment_type employment_type not null default 'full_time',
  benefits text,
  acceptance_deadline date,
  pdf_url text,
  status offer_status not null default 'draft',
  esignature_provider text,
  esignature_envelope_id text,
  signed_at timestamptz,
  approved_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_offers_application on public.offers(application_id);
create index idx_offers_candidate on public.offers(candidate_id);
create index idx_offers_status on public.offers(status);

create trigger trg_offers_updated_at before update on public.offers
  for each row execute function public.set_updated_at();

-- =========================================================================
-- ONBOARDING_TASKS
-- =========================================================================

create table public.onboarding_tasks (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  offer_id uuid references public.offers(id) on delete set null,
  task_name text not null,
  description text,
  assigned_to uuid references public.profiles(id),
  due_date date,
  status onboarding_task_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_onboarding_tasks_candidate on public.onboarding_tasks(candidate_id);
create index idx_onboarding_tasks_status on public.onboarding_tasks(status);

create trigger trg_onboarding_tasks_updated_at before update on public.onboarding_tasks
  for each row execute function public.set_updated_at();

-- =========================================================================
-- NOTIFICATIONS
-- =========================================================================

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  channel notification_channel not null default 'dashboard',
  title text not null,
  message text not null,
  is_read boolean not null default false,
  related_application_id uuid references public.applications(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_notifications_user on public.notifications(user_id);
create index idx_notifications_unread on public.notifications(user_id, is_read);

-- =========================================================================
-- AUTOMATION_LOGS (audit trail for every Make.com / system action)
-- =========================================================================

create table public.automation_logs (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references public.candidates(id) on delete set null,
  application_id uuid references public.applications(id) on delete set null,
  action text not null,
  status automation_log_status not null,
  source text not null default 'make.com',
  payload jsonb,
  error_message text,
  created_at timestamptz not null default now()
);

create index idx_automation_logs_application on public.automation_logs(application_id);
create index idx_automation_logs_candidate on public.automation_logs(candidate_id);
create index idx_automation_logs_created on public.automation_logs(created_at desc);

-- =========================================================================
-- APP_SETTINGS (single row — admin-configurable company/scoring/interview defaults)
-- =========================================================================

create table public.app_settings (
  id uuid primary key default gen_random_uuid(),
  company_name text not null default 'HireFlow AI',
  default_scoring_weights jsonb not null default '{"skills":35,"experience":25,"technical":20,"education":10,"portfolio":10}',
  default_interview_duration_minutes int not null default 45,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_app_settings_updated_at before update on public.app_settings
  for each row execute function public.set_updated_at();

insert into public.app_settings (company_name) values ('HireFlow AI');

-- =========================================================================
-- ROW LEVEL SECURITY
-- =========================================================================

alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.candidates enable row level security;
alter table public.applications enable row level security;
alter table public.candidate_scores enable row level security;
alter table public.interviews enable row level security;
alter table public.interview_feedback enable row level security;
alter table public.offers enable row level security;
alter table public.onboarding_tasks enable row level security;
alter table public.notifications enable row level security;
alter table public.automation_logs enable row level security;
alter table public.app_settings enable row level security;

-- profiles: everyone signed in can read profiles (needed for assignee pickers); only admins can change roles.
create policy "profiles_select_all" on public.profiles for select using (auth.role() = 'authenticated');
create policy "profiles_update_self" on public.profiles for update using (id = auth.uid());
create policy "profiles_admin_all" on public.profiles for all using (public.current_role() = 'admin');

-- jobs: admin/hr_manager/recruiter manage all jobs; hiring_manager sees/edits only their assigned jobs; interviewer read-only on published jobs.
create policy "jobs_full_access" on public.jobs for all
  using (public.current_role() in ('admin', 'hr_manager', 'recruiter'));
create policy "jobs_hiring_manager_own" on public.jobs for select
  using (public.current_role() = 'hiring_manager' and hiring_manager_id = auth.uid());
create policy "jobs_hiring_manager_update_own" on public.jobs for update
  using (public.current_role() = 'hiring_manager' and hiring_manager_id = auth.uid());
create policy "jobs_interviewer_read_published" on public.jobs for select
  using (public.current_role() = 'interviewer' and status = 'published');

-- Helper functions (SECURITY DEFINER) that let policies on applications/interviews/candidates/
-- candidate_scores check each other's data WITHOUT re-entering each other's RLS policies.
-- Without these, e.g. interviews' policy reading applications + applications' policy reading
-- interviews creates a direct cycle and Postgres raises "infinite recursion detected".
create or replace function public.application_job_hiring_manager(app_id uuid)
returns uuid as $$
  select j.hiring_manager_id
  from public.applications a
  join public.jobs j on j.id = a.job_id
  where a.id = app_id;
$$ language sql stable security definer set search_path = public;

create or replace function public.application_interviewer_ids(app_id uuid)
returns setof uuid as $$
  select interviewer_id from public.interviews where application_id = app_id and interviewer_id is not null;
$$ language sql stable security definer set search_path = public;

-- candidates: admin/hr_manager/recruiter full access; hiring_manager/interviewer read-only via their applications (checked at application level, candidates readable if linked).
create policy "candidates_full_access" on public.candidates for all
  using (public.current_role() in ('admin', 'hr_manager', 'recruiter'));
create policy "candidates_linked_read" on public.candidates for select
  using (
    public.current_role() in ('hiring_manager', 'interviewer')
    and exists (
      select 1 from public.applications a
      where a.candidate_id = candidates.id
        and (public.application_job_hiring_manager(a.id) = auth.uid()
             or auth.uid() in (select public.application_interviewer_ids(a.id)))
    )
  );

-- applications: admin/hr_manager/recruiter full access; hiring_manager sees applications for their jobs; interviewer sees applications they interview for.
create policy "applications_full_access" on public.applications for all
  using (public.current_role() in ('admin', 'hr_manager', 'recruiter'));
create policy "applications_hiring_manager_read" on public.applications for select
  using (
    public.current_role() = 'hiring_manager'
    and public.application_job_hiring_manager(applications.id) = auth.uid()
  );
create policy "applications_interviewer_read" on public.applications for select
  using (
    public.current_role() = 'interviewer'
    and auth.uid() in (select public.application_interviewer_ids(applications.id))
  );

-- candidate_scores: same visibility as applications; only recruiting roles can write (AI/backend writes via service role).
create policy "candidate_scores_full_access" on public.candidate_scores for all
  using (public.current_role() in ('admin', 'hr_manager', 'recruiter'));
create policy "candidate_scores_related_read" on public.candidate_scores for select
  using (
    public.application_job_hiring_manager(candidate_scores.application_id) = auth.uid()
    or auth.uid() in (select public.application_interviewer_ids(candidate_scores.application_id))
  );

-- interviews: recruiting roles full access; hiring_manager read for their jobs; interviewer sees/updates their own interviews.
create policy "interviews_full_access" on public.interviews for all
  using (public.current_role() in ('admin', 'hr_manager', 'recruiter'));
create policy "interviews_hiring_manager_read" on public.interviews for select
  using (
    public.current_role() = 'hiring_manager'
    and public.application_job_hiring_manager(interviews.application_id) = auth.uid()
  );
create policy "interviews_interviewer_own" on public.interviews for select
  using (public.current_role() = 'interviewer' and interviewer_id = auth.uid());
create policy "interviews_interviewer_update_own" on public.interviews for update
  using (public.current_role() = 'interviewer' and interviewer_id = auth.uid());

-- interview_feedback: recruiting roles full access; interviewer can create/read/update their own feedback.
create policy "interview_feedback_full_access" on public.interview_feedback for all
  using (public.current_role() in ('admin', 'hr_manager', 'recruiter'));
create policy "interview_feedback_interviewer_own" on public.interview_feedback for all
  using (public.current_role() = 'interviewer' and interviewer_id = auth.uid());

-- offers: recruiting roles full access only (salary/contract data is sensitive).
create policy "offers_full_access" on public.offers for all
  using (public.current_role() in ('admin', 'hr_manager', 'recruiter'));

-- onboarding_tasks: recruiting roles full access; assignee can read/update their own tasks.
create policy "onboarding_tasks_full_access" on public.onboarding_tasks for all
  using (public.current_role() in ('admin', 'hr_manager', 'recruiter'));
create policy "onboarding_tasks_assignee" on public.onboarding_tasks for select
  using (assigned_to = auth.uid());
create policy "onboarding_tasks_assignee_update" on public.onboarding_tasks for update
  using (assigned_to = auth.uid());

-- notifications: users see and manage only their own.
create policy "notifications_own" on public.notifications for all
  using (user_id = auth.uid());

-- automation_logs: recruiting roles + admin read; Make.com writes via the service role,
-- but HR actions taken directly in the dashboard (e.g. manual status changes) also log via this insert policy.
create policy "automation_logs_read" on public.automation_logs for select
  using (public.current_role() in ('admin', 'hr_manager', 'recruiter'));
create policy "automation_logs_insert_authenticated" on public.automation_logs for insert
  with check (public.current_role() in ('admin', 'hr_manager', 'recruiter'));

-- app_settings: everyone signed in can read (needed for offer letters, job defaults); only admins edit.
create policy "app_settings_read" on public.app_settings for select using (auth.role() = 'authenticated');
create policy "app_settings_admin_write" on public.app_settings for all using (public.current_role() = 'admin');
