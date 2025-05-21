-- SurveyKong Minimal JSONB Schema (Projects & Survey Specs Only)

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  data jsonb not null,
  created_at timestamp with time zone default now()
);

create table if not exists survey_specs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  data jsonb not null,
  created_at timestamp with time zone default now()
); 
