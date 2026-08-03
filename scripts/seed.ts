// Realistic demo data for the HireFlow AI dashboard: 5 jobs, ~50 candidates,
// applications spread across statuses/sources, and screening scores where applicable.
// Run with: npm run seed  (requires SUPABASE_SERVICE_ROLE_KEY in .env.local)

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function pickMany<T>(arr: readonly T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const JOBS = [
  {
    title: 'AI Automation Engineer',
    department: 'Engineering',
    location: 'Remote',
    employment_type: 'full_time' as const,
    salary_min: 90000,
    salary_max: 130000,
    experience_required: '2+ years',
    education: "Bachelor's in CS or related field",
    required_skills: ['Python', 'APIs', 'Make.com', 'Automation'],
    preferred_skills: ['n8n', 'LLM prompting', 'Groq'],
    responsibilities:
      'Design and build automated workflows connecting AI models to business systems. Own end-to-end automation architecture.',
    description:
      'We are looking for an AI Automation Engineer to build and maintain the automation backbone connecting our AI systems to core business processes.',
    positions_count: 1,
    status: 'published' as const,
  },
  {
    title: 'Senior Full-Stack Engineer',
    department: 'Engineering',
    location: 'Lahore, PK',
    employment_type: 'full_time' as const,
    salary_min: 110000,
    salary_max: 160000,
    experience_required: '4+ years',
    education: "Bachelor's in CS or equivalent experience",
    required_skills: ['TypeScript', 'React', 'Next.js', 'PostgreSQL'],
    preferred_skills: ['Supabase', 'GraphQL', 'Docker'],
    responsibilities: 'Lead feature development across the stack, mentor junior engineers, own critical services.',
    description: 'Senior engineer to own major product surfaces end-to-end, from database schema to UI polish.',
    positions_count: 2,
    status: 'published' as const,
  },
  {
    title: 'HR Business Partner',
    department: 'People',
    location: 'Karachi, PK',
    employment_type: 'full_time' as const,
    salary_min: 70000,
    salary_max: 95000,
    experience_required: '3+ years',
    education: "Bachelor's in HR or Business Administration",
    required_skills: ['Employee Relations', 'HRIS', 'Performance Management'],
    preferred_skills: ['SHRM Certification', 'Recruiting'],
    responsibilities: 'Partner with department heads on hiring plans, employee relations, and performance cycles.',
    description: 'Strategic HR partner supporting our fastest-growing departments.',
    positions_count: 1,
    status: 'published' as const,
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote',
    employment_type: 'full_time' as const,
    salary_min: 80000,
    salary_max: 115000,
    experience_required: '3+ years',
    education: "Bachelor's in Design or equivalent portfolio",
    required_skills: ['Figma', 'Design Systems', 'User Research'],
    preferred_skills: ['Motion design', 'Frontend basics'],
    responsibilities: 'Own product design from discovery to shipped UI across web and mobile.',
    description: 'Product Designer to shape the core experience of a B2B SaaS platform used by HR teams daily.',
    positions_count: 1,
    status: 'draft' as const,
  },
  {
    title: 'DevOps Engineer',
    department: 'Engineering',
    location: 'Remote',
    employment_type: 'contract' as const,
    salary_min: 85000,
    salary_max: 120000,
    experience_required: '3+ years',
    education: "Bachelor's in CS or equivalent",
    required_skills: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD'],
    preferred_skills: ['Vercel', 'Observability tooling'],
    responsibilities: 'Own infrastructure reliability, deployment pipelines, and cost optimization.',
    description: 'DevOps contractor to modernize our deployment pipeline and infrastructure-as-code setup.',
    positions_count: 1,
    status: 'paused' as const,
  },
];

const FIRST_NAMES = [
  'Ayesha', 'Bilal', 'Sara', 'Hamza', 'Zainab', 'Ali', 'Mariam', 'Usman', 'Fatima', 'Omar',
  'Hina', 'Ahmed', 'Sana', 'Faisal', 'Amna', 'Kashif', 'Nida', 'Waqas', 'Rabia', 'Tariq',
  'Emily', 'James', 'Sophia', 'Liam', 'Olivia', 'Noah', 'Ava', 'William', 'Isabella', 'Ethan',
  'Chen', 'Wei', 'Li', 'Yuki', 'Hiro', 'Maria', 'Carlos', 'Sofia', 'Diego', 'Valentina',
  'Ibrahim', 'Layla', 'Karim', 'Noor', 'Yusuf', 'Amara', 'Tariq', 'Zara', 'Adeel', 'Mahnoor',
];
const LAST_NAMES = [
  'Khan', 'Ahmed', 'Malik', 'Siddiqui', 'Raza', 'Butt', 'Sheikh', 'Qureshi', 'Iqbal', 'Farooq',
  'Smith', 'Johnson', 'Williams', 'Brown', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Wilson',
  'Chen', 'Wang', 'Tanaka', 'Kim', 'Nakamura', 'Lopez', 'Martinez', 'Gonzalez', 'Hassan', 'Ali',
];
const COMPANIES = ['TechNova', 'Bright Labs', 'Cloudra', 'Vertex Systems', 'Nimbus AI', 'Pixel Forge', 'DataSphere', 'Quantum Works'];
const ROLES = ['Software Engineer', 'Product Manager', 'Data Analyst', 'UX Designer', 'DevOps Engineer', 'HR Coordinator', 'QA Engineer'];
const SKILLS = ['Python', 'TypeScript', 'React', 'Node.js', 'SQL', 'AWS', 'Docker', 'Figma', 'Communication', 'Leadership', 'Project Management', 'Kubernetes', 'GraphQL', 'Next.js'];
const CITIES = ['Karachi, PK', 'Lahore, PK', 'Islamabad, PK', 'Remote', 'Dubai, UAE', 'London, UK', 'Berlin, DE'];
const SOURCES = ['linkedin', 'indeed', 'company_website', 'referral', 'recruiter', 'job_board', 'social_media', 'other'] as const;

async function main() {
  console.log('Seeding jobs...');
  const { data: jobs, error: jobsError } = await supabase.from('jobs').insert(JOBS).select('id, title, required_skills');
  if (jobsError) throw jobsError;
  console.log(`  created ${jobs.length} jobs`);

  console.log('Seeding candidates...');
  const candidatesPayload = Array.from({ length: 50 }).map((_, i) => {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    return {
      full_name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`,
      phone: `+92 3${randInt(10, 99)} ${randInt(1000000, 9999999)}`,
      location: pick(CITIES),
      linkedin_url: `https://linkedin.com/in/${first.toLowerCase()}-${last.toLowerCase()}${i}`,
      github_url: Math.random() > 0.4 ? `https://github.com/${first.toLowerCase()}${last.toLowerCase()}` : null,
      portfolio_url: Math.random() > 0.7 ? `https://${first.toLowerCase()}${last.toLowerCase()}.dev` : null,
      years_experience: randInt(0, 12),
      education: pick(["Bachelor's in Computer Science", "Master's in Business Administration", "Bachelor's in Design", "Bachelor's in HR", "Master's in Computer Science"]),
      previous_companies: pickMany(COMPANIES, randInt(1, 3)),
      previous_roles: pickMany(ROLES, randInt(1, 2)),
      technical_skills: pickMany(SKILLS, randInt(3, 7)),
      soft_skills: pickMany(['Communication', 'Leadership', 'Problem Solving', 'Teamwork', 'Adaptability'], 3),
      certifications: Math.random() > 0.6 ? pickMany(['AWS Certified', 'PMP', 'SHRM-CP', 'Scrum Master'], 1) : [],
    };
  });

  const { data: candidates, error: candidatesError } = await supabase
    .from('candidates')
    .insert(candidatesPayload)
    .select('id, technical_skills');
  if (candidatesError) throw candidatesError;
  console.log(`  created ${candidates.length} candidates`);

  console.log('Seeding applications + scores...');
  const statusPool: string[] = [
    ...Array(6).fill('applied'),
    ...Array(5).fill('screening'),
    ...Array(4).fill('hr_review'),
    ...Array(4).fill('shortlisted'),
    ...Array(3).fill('interview_scheduled'),
    ...Array(3).fill('interviewed'),
    ...Array(2).fill('final_review'),
    ...Array(2).fill('offer_pending'),
    ...Array(2).fill('offer_sent'),
    ...Array(2).fill('offer_accepted'),
    ...Array(4).fill('hired'),
    ...Array(3).fill('rejected'),
    ...Array(1).fill('withdrawn'),
    ...Array(2).fill('on_hold'),
  ];

  let appCount = 0;
  let scoreCount = 0;

  for (const candidate of pickMany(candidates, 45)) {
    const job = pick(jobs);
    const status = pick(statusPool);

    const { data: application, error: appError } = await supabase
      .from('applications')
      .insert({
        job_id: job.id,
        candidate_id: candidate.id,
        status,
        source: pick(SOURCES),
        expected_salary: randInt(70, 150) * 1000,
        notice_period: pick(['Immediate', '2 weeks', '1 month', '2 months']),
      })
      .select('id')
      .single();

    if (appError) {
      if (appError.code === '23505') continue; // duplicate job+candidate pair, skip
      throw appError;
    }
    appCount++;

    const scoredStatuses = ['screening', 'hr_review', 'shortlisted', 'interview_scheduled', 'interviewed', 'final_review', 'offer_pending', 'offer_sent', 'offer_accepted', 'hired', 'rejected'];
    if (scoredStatuses.includes(status)) {
      const matched = candidate.technical_skills.filter((s: string) => job.required_skills.includes(s));
      const missing = job.required_skills.filter((s: string) => !candidate.technical_skills.includes(s));

      const skills = randInt(55, 98);
      const experience = randInt(50, 98);
      const technical = randInt(55, 98);
      const education = randInt(60, 98);
      const portfolio = randInt(50, 95);
      const weighted = Math.round(skills * 0.35 + experience * 0.25 + technical * 0.2 + education * 0.1 + portfolio * 0.1);

      await supabase.from('candidate_scores').insert({
        application_id: application.id,
        skills_score: skills,
        experience_score: experience,
        technical_score: technical,
        education_score: education,
        portfolio_score: portfolio,
        weighted_final_score: weighted,
        matched_skills: matched,
        missing_skills: missing,
        strengths: matched.length > 0 ? [`Strong background in ${matched[0]}`] : ['Relevant industry experience'],
        concerns: missing.length > 0 ? [`Limited exposure to ${missing[0]}`] : [],
        ai_summary: `Candidate shows a ${weighted >= 80 ? 'strong' : weighted >= 65 ? 'moderate' : 'partial'} match against job requirements based on skills and experience overlap.`,
        ai_recommendation: weighted >= 85 ? 'shortlist' : weighted >= 70 ? 'hr_review' : 'hold',
        model_used: 'demo-seed',
      });
      scoreCount++;
    }

    await supabase.from('automation_logs').insert({
      application_id: application.id,
      candidate_id: candidate.id,
      action: 'APPLICATION_CREATED',
      status: 'success',
      source: 'seed-script',
    });
  }

  console.log(`  created ${appCount} applications, ${scoreCount} candidate scores`);
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
